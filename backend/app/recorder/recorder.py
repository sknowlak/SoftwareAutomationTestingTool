from playwright.sync_api import sync_playwright
import json
import os
import time
from datetime import datetime
from typing import List, Dict, Any, Optional

class WebRecorder:
    def __init__(self, base_url: str, output_dir: str = "recordings"):
        self.base_url = base_url
        self.output_dir = output_dir
        self.recording_id = f"recording_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.recording_path = os.path.join(output_dir, self.recording_id)
        self.actions = []
        self.browser = None
        self.page = None
        
        # Create output directory if it doesn't exist
        os.makedirs(self.recording_path, exist_ok=True)
    
    def start_recording(self, browser_type: str = "chromium", headless: bool = False):
        """Start a new recording session"""
        playwright = sync_playwright().start()
        
        if browser_type == "chromium":
            self.browser = playwright.chromium.launch(headless=headless)
        elif browser_type == "firefox":
            self.browser = playwright.firefox.launch(headless=headless)
        elif browser_type == "webkit":
            self.browser = playwright.webkit.launch(headless=headless)
        else:
            raise ValueError(f"Unsupported browser type: {browser_type}")
        
        self.page = self.browser.new_page()
        
        # Set up event listeners
        self._setup_event_listeners()
        
        # Navigate to the base URL
        self.page.goto(self.base_url)
        
        return self.recording_id
    
    def _setup_event_listeners(self):
        """Set up event listeners to capture user actions"""
        # Capture clicks
        self.page.on("click", lambda source: self._record_action("click", source))
        
        # Capture navigation
        self.page.on("framenavigated", lambda frame: self._record_navigation(frame))
        
        # Capture form inputs
        self.page.on("input", lambda e: self._record_input(e))
    
    def _record_action(self, action_type: str, source: Dict[str, Any]):
        """Record a user action"""
        timestamp = time.time()
        
        # Take a screenshot
        screenshot_path = os.path.join(self.recording_path, f"step_{len(self.actions)}.png")
        self.page.screenshot(path=screenshot_path)
        
        # Get element selector
        selector = self._get_best_selector(source)
        
        action = {
            "type": action_type,
            "timestamp": timestamp,
            "url": self.page.url,
            "selector": selector,
            "screenshot": screenshot_path
        }
        
        self.actions.append(action)
    
    def _record_navigation(self, frame):
        """Record a navigation event"""
        if frame.is_main_frame():
            timestamp = time.time()
            
            # Take a screenshot
            screenshot_path = os.path.join(self.recording_path, f"step_{len(self.actions)}.png")
            self.page.screenshot(path=screenshot_path)
            
            action = {
                "type": "navigation",
                "timestamp": timestamp,
                "url": frame.url,
                "screenshot": screenshot_path
            }
            
            self.actions.append(action)
    
    def _record_input(self, event):
        """Record an input event"""
        timestamp = time.time()
        
        # Take a screenshot
        screenshot_path = os.path.join(self.recording_path, f"step_{len(self.actions)}.png")
        self.page.screenshot(path=screenshot_path)
        
        # Get element selector
        selector = self._get_best_selector(event.get("target"))
        
        action = {
            "type": "input",
            "timestamp": timestamp,
            "url": self.page.url,
            "selector": selector,
            "value": event.get("value", ""),
            "screenshot": screenshot_path
        }
        
        self.actions.append(action)
    
    def _get_best_selector(self, element) -> str:
        """Get the best selector for an element"""
        # Try to get a unique ID
        element_id = element.get("id")
        if element_id:
            return f"#{element_id}"
        
        # Try to get a unique class
        element_class = element.get("class")
        if element_class:
            return f".{element_class.replace(' ', '.')}"
        
        # Fall back to XPath
        return self.page.eval_on_selector(element, "el => {
            const xpath = document.evaluate(
                'xpath', el, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
            ).singleNodeValue;
            return xpath;
        }")
    
    def stop_recording(self):
        """Stop the recording session and save the recorded actions"""
        if self.browser:
            self.browser.close()
        
        # Save actions to a JSON file
        actions_file = os.path.join(self.recording_path, "actions.json")
        with open(actions_file, "w") as f:
            json.dump(self.actions, f, indent=2)
        
        return {
            "recording_id": self.recording_id,
            "actions_count": len(self.actions),
            "actions_file": actions_file
        }
    
    def generate_test_script(self, output_file: Optional[str] = None):
        """Generate a Playwright test script from the recorded actions"""
        if not output_file:
            output_file = os.path.join(self.recording_path, "test_script.py")
        
        script_lines = [
            "from playwright.sync_api import sync_playwright",
            "import time",
            "",
            "def run(playwright):",
            f"    browser = playwright.chromium.launch(headless=False)",
            f"    context = browser.new_context()",
            f"    page = context.new_page()",
            "",
            f"    # Navigate to the base URL",
            f"    page.goto('{self.base_url}')",
            ""
        ]
        
        for i, action in enumerate(self.actions):
            action_type = action.get("type")
            
            if action_type == "navigation":
                script_lines.append(f"    # Step {i+1}: Navigate to {action.get('url')}")
                script_lines.append(f"    page.goto('{action.get('url')}')")
            
            elif action_type == "click":
                script_lines.append(f"    # Step {i+1}: Click on element")
                script_lines.append(f"    page.click('{action.get('selector')}')")
            
            elif action_type == "input":
                script_lines.append(f"    # Step {i+1}: Input text")
                script_lines.append(f"    page.fill('{action.get('selector')}', '{action.get('value')}')")
            
            script_lines.append("")
        
        script_lines.extend([
            "    # Close the browser",
            "    browser.close()",
            "",
            "with sync_playwright() as playwright:",
            "    run(playwright)",
            ""
        ])
        
        with open(output_file, "w") as f:
            f.write("\n".join(script_lines))
        
        return output_file
