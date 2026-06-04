package com.iganapolsky.agentbill.ui

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.iganapolsky.agentbill.MainActivity
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class MainActivityE2ETest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    /**
     * Wait until at least one node with [text] is present. Navigation between Compose destinations
     * involves a recomposition transition, so asserting immediately after a click can race; this
     * waits for the destination to settle. All strings below are verified against the actual UI.
     */
    private fun awaitText(text: String) {
        composeTestRule.waitUntil(timeoutMillis = 5_000) {
            composeTestRule.onAllNodesWithText(text).fetchSemanticsNodes().isNotEmpty()
        }
    }

    @Test
    fun testAppE2ENavigationFlow() {
        // 1. Home screen renders (TopAppBar title + tagline)
        awaitText("AgentBill")
        composeTestRule.onNodeWithText("AgentBill").assertIsDisplayed()
        composeTestRule.onNodeWithText("Track your AI provider bills.").assertIsDisplayed()

        // 2. Home -> Settings ("Settings & API key" button), confirm we landed
        composeTestRule.onNodeWithText("Settings & API key").performClick()
        awaitText("Save key")
        composeTestRule.onNodeWithText("Settings").assertIsDisplayed()
        composeTestRule.onNodeWithText("Save key").assertIsDisplayed()

        // 3. Settings -> back -> Home
        composeTestRule.onNodeWithContentDescription("Back").performClick()
        awaitText("Audit a transcript")

        // 4. Home -> Audit, confirm the audit screen's primary action is present
        composeTestRule.onNodeWithText("Audit a transcript").performClick()
        awaitText("Run audit")
        composeTestRule.onNodeWithText("Run audit").assertIsDisplayed()
    }
}
