package com.iganapolsky.agentbill.core.analysis

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class RedundancyAnalyzerTest {

    private val analyzer = RedundancyAnalyzer(usdPerMillionInputTokens = 3.00)

    @Test
    fun emptyInputHasNoFindings() {
        val report = analyzer.analyze("")
        assertEquals(0L, report.totalTokens)
        assertEquals(0L, report.redundantTokens)
        assertEquals(0.0, report.redundancyRatio, 0.0)
        assertEquals(0, report.redundancyPercent)
        assertFalse(report.hasFindings)
    }

    @Test
    fun uniqueContentReportsNoRedundancy() {
        val input = """
            Initialize the deployment pipeline for region us-east-1.
            Validate the database migration against the staging schema.
            Roll forward the feature flag for premium subscribers only.
        """.trimIndent()
        val report = analyzer.analyze(input)
        assertEquals(0L, report.redundantTokens)
        assertFalse(report.hasFindings)
    }

    @Test
    fun exactDuplicateBlocksCountAsRepeatTax() {
        val dupe = "ERROR: connection refused while calling the inventory service endpoint"
        val input = (1..5).joinToString("\n") { dupe }
        val report = analyzer.analyze(input)

        assertTrue("expected exact-duplicate waste", report.exactDuplicateTokens > 0)
        // 5 identical lines => 4 of them are pure waste.
        val perLine = analyzer.estimateTokens(dupe)
        assertEquals(perLine * 4, report.exactDuplicateTokens)
        assertTrue(report.hasFindings)
    }

    @Test
    fun cacheBustingTimestampsAreDetectedAsVolatileRepeats() {
        // Same payload, only the timestamp/UUID changes each call — classic prompt-cache buster.
        val input = """
            [2026-06-03T10:00:01Z] request id=a1b2c3d4-1111-2222-3333-444455556666 fetch user profile
            [2026-06-03T10:05:42Z] request id=a1b2c3d4-7777-2222-3333-444455556666 fetch user profile
            [2026-06-03T11:15:09Z] request id=a1b2c3d4-8888-2222-3333-444455556666 fetch user profile
        """.trimIndent()
        val report = analyzer.analyze(input)

        assertTrue("expected volatile cache-busting repeats", report.volatileRepeatTokens > 0)
        assertTrue("expected cache-busting blocks counted", report.cacheBustingBlocks >= 2)
        assertTrue(report.hasFindings)
    }

    @Test
    fun redundantTokensNeverExceedTotal() {
        val input = (1..50).joinToString("\n") {
            "[2026-06-03T10:0$it:01Z] verbose tool output schema dump for service alpha-beta-gamma"
        }
        val report = analyzer.analyze(input)
        assertTrue(report.redundantTokens <= report.totalTokens)
        assertTrue(report.redundancyRatio <= 1.0)
        assertTrue(report.redundancyPercent in 0..100)
    }

    @Test
    fun shortLinesBelowThresholdAreIgnored() {
        // Lines under MIN_BLOCK_CHARS shouldn't be treated as meaningful repeated blocks.
        val input = (1..10).joinToString("\n") { "ok" }
        val report = analyzer.analyze(input)
        assertEquals(0L, report.redundantTokens)
    }

    @Test
    fun projectedMonthlyWasteScalesWithPricingAndRuns() {
        val dupe = "verbose redundant machine generated json schema block alpha beta gamma delta"
        val input = (1..3).joinToString("\n") { dupe }
        val report = analyzer.analyze(input)

        val expected = report.redundantTokens / 1_000_000.0 * 3.00 * RedundancyAnalyzer.RUNS_PER_MONTH
        assertEquals(expected, report.projectedMonthlyWasteUsd, 1e-9)
    }

    @Test
    fun evidenceBlockContainsMeasuredNumbers() {
        val dupe = "ERROR: connection refused while calling the inventory service endpoint"
        val report = analyzer.analyze((1..4).joinToString("\n") { dupe })
        val block = report.toEvidenceBlock()

        assertTrue(block.contains("MEASURED LOCAL REDUNDANCY SCAN"))
        assertTrue(block.contains(report.totalTokens.toString()))
        assertTrue(block.contains("${report.redundancyPercent}%"))
    }

    @Test
    fun estimateTokensUsesFourCharsPerTokenHeuristic() {
        val text = "a".repeat(400)
        assertEquals(100L, analyzer.estimateTokens(text))
    }

    @Test
    fun retryLoopOfRepeatedErrorLinesIsDetected() {
        // Same failing operation re-attempted with only the volatile attempt id changing — the
        // runaway-loop token burn Netflix Headroom flags as machine-metadata waste.
        val input = """
            ERROR attempt 1 failed: timeout calling payments service id=aaaa1111
            ERROR attempt 2 failed: timeout calling payments service id=bbbb2222
            ERROR attempt 3 failed: timeout calling payments service id=cccc3333
            ERROR attempt 4 failed: timeout calling payments service id=dddd4444
        """.trimIndent()
        val report = analyzer.analyze(input)

        assertTrue("expected retry-loop waste", report.retryLoopTokens > 0)
        assertTrue("expected retry-loop hits counted", report.retryLoopHits >= 3)
        assertTrue(report.hasFindings)
    }

    @Test
    fun giantJsonLineIsCountedAsToolBloat() {
        // An 800-char single-line JSON-ish tool dump blows past the reasonable per-block budget.
        val giant = "{\"data\":\"" + "x".repeat(800) + "\":endofdump}"
        val report = analyzer.analyze(giant)

        assertTrue("expected tool-output bloat waste", report.toolBloatTokens > 0)
        assertTrue(report.hasFindings)
    }

    @Test
    fun redundantTokensNeverExceedTotalWithNewDetectors() {
        // Stress the retry-loop and tool-bloat detectors together; the overlap cap must still hold.
        val retries = (1..30).joinToString("\n") {
            "ERROR retrying attempt $it: Traceback failed to reach inventory service id=$it"
        }
        val jsonDump = (1..30).joinToString("\n") {
            "  \"field_$it\": \"verbose machine generated schema value alpha beta gamma delta\""
        }
        val report = analyzer.analyze("$retries\n$jsonDump")

        assertTrue(report.redundantTokens <= report.totalTokens)
        assertTrue(report.redundancyRatio <= 1.0)
        assertTrue(report.redundancyPercent in 0..100)
    }
}
