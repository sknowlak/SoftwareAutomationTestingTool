import json
import os
from typing import List, Dict, Any, Optional

class TestGenerator:
    def __init__(self, recording_path: str):
        self.recording_path = recording_path
        self.actions_file = os.path.join(recording_path, "actions.json")
        self.actions = self._load_actions()
    
    def _load_actions(self) -> List[Dict[str, Any]]:
        """Load recorded actions from the JSON file"""
        if not os.path.exists(self.actions_file):
            raise FileNotFoundError(f"Actions file not found: {self.actions_file}")
        
        with open(self.actions_file, "r") as f:
            return json.load(f)
    
    def generate_playwright_test(self, output_file: Optional[str] = None, test_name: str = "Recorded Test") -> str:
        """Generate a Playwright test script"""
        if not output_file:
            output_file = os.path.join(self.recording_path, "playwright_test.py")
        
        base_url = self.actions[0]["url"] if self.actions else ""
        
        script_lines = [
            "from playwright.sync_api import Playwright, sync_playwright, expect",
            "import pytest",
            "",
            f"def test_{test_name.lower().replace(' ', '_')}(playwright: Playwright):",
            "    browser = playwright.chromium.launch(headless=True)",
            "    context = browser.new_context()",
            "    page = context.new_page()",
            "",
            f"    # Navigate to the base URL",
            f"    page.goto('{base_url}')",
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
                
            # Add a simple assertion after each action
            if i > 0 and i % 3 == 0:  # Add an assertion every 3 steps
                script_lines.append(f"    # Assertion: Page has expected URL")
                script_lines.append(f"    expect(page).to_have_url('{action.get('url')}')")
            
            script_lines.append("")
        
        script_lines.extend([
            "    # Close the browser",
            "    context.close()",
            "    browser.close()",
            ""
        ])
        
        with open(output_file, "w") as f:
            f.write("\n".join(script_lines))
        
        return output_file
    
    def generate_pytest_test(self, output_file: Optional[str] = None, test_name: str = "Recorded Test") -> str:
        """Generate a pytest test script"""
        if not output_file:
            output_file = os.path.join(self.recording_path, "pytest_test.py")
        
        base_url = self.actions[0]["url"] if self.actions else ""
        
        script_lines = [
            "import pytest",
            "from playwright.sync_api import Playwright, sync_playwright, expect",
            "",
            "@pytest.fixture(scope='function')",
            "def browser_context_args(browser_context_args):",
            "    return {",
            "        **browser_context_args,",
            "        'viewport': {",
            "            'width': 1920,",
            "            'height': 1080,",
            "        }",
            "    }",
            "",
            f"def test_{test_name.lower().replace(' ', '_')}(page):",
            f"    # Navigate to the base URL",
            f"    page.goto('{base_url}')",
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
                
            # Add a simple assertion after each action
            if i > 0 and i % 3 == 0:  # Add an assertion every 3 steps
                script_lines.append(f"    # Assertion: Page has expected URL")
                script_lines.append(f"    expect(page).to_have_url('{action.get('url')}')")
            
            script_lines.append("")
        
        with open(output_file, "w") as f:
            f.write("\n".join(script_lines))
        
        return output_file
    
    def generate_test_steps(self) -> List[Dict[str, Any]]:
        """Generate test steps for database storage"""
        test_steps = []
        
        for i, action in enumerate(self.actions):
            action_type = action.get("type")
            step = {
                "order": i,
                "action_type": action_type,
                "selector": action.get("selector"),
                "selector_type": "css",  # Default to CSS selector
                "value": action.get("value", ""),
                "screenshot": action.get("screenshot", "")
            }
            
            test_steps.append(step)
        
        return test_steps
