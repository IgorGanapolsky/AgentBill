package com.iganapolsky.agentbill.ui

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
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
     * Wait until at least one node with [text] exists. Navigating between Compose destinations
     * recomposes the tree, so asserting immediately after a click can race; this waits for the
     * destination to settle. We confirm navigation via TopAppBar titles, which are always at the
     * top of the screen (no scrolling needed). All strings are verified against the actual UI.
     */
    private fun awaitText(text: String) {
        composeTestRule.waitUntil(timeoutMillis = 10_000) {
            composeTestRule.onAllNodesWithText(text).fetchSemanticsNodes().isNotEmpty()
        }
    }

    @Test
    fun testAppE2ENavigationFlow() {
        // 1. Home screen renders (TopAppBar title)
        awaitText("AgentBill")
        composeTestRule.onNodeWithText("AgentBill").assertIsDisplayed()

        // 2. Home -> Settings. The button is below the fold inside a scrolling Column, so scroll it
        //    into view before clicking (performClick does NOT auto-scroll).
        composeTestRule.onNodeWithText("Settings & API key").performScrollTo().performClick()
        awaitText("Settings")
        composeTestRule.onNodeWithText("Settings").assertIsDisplayed()

        // 3. Settings -> back -> Home (Back is in the TopAppBar, always visible)
        composeTestRule.onNodeWithContentDescription("Back").performClick()
        awaitText("AgentBill")
        composeTestRule.onNodeWithText("AgentBill").assertIsDisplayed()

        // 4. Home -> Audit, confirm via the Audit TopAppBar title + primary action exists
        composeTestRule.onNodeWithText("Audit a transcript").performScrollTo().performClick()
        awaitText("Audit")
        composeTestRule.onNodeWithText("Run audit").assertExists()
    }
}
