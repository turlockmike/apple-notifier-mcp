//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";

const send_notificationEval: EvalFunction = {
  name: 'Send Notification Tool Evaluation',
  description: 'Evaluates the send_notification tool by testing macOS notification functionality',
  run: async () => {
    const result = await grade(openai("gpt-4"), "Please send a macOS notification using the 'send_notification' tool with the title 'Greetings', message 'Hello from AI', subtitle 'Testing notifications', and disable sound.");
    return JSON.parse(result);
  }
};

const prompt_userEval: EvalFunction = {
    name: 'prompt_user Evaluation',
    description: 'Tests the functionality of the prompt_user tool by verifying dialog prompt input and options',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Display a dialog prompt with the message 'Please enter your name:' using 'John Doe' as the default answer, custom buttons labeled 'Confirm' and 'Cancel', and an icon of 'note'.");
        return JSON.parse(result);
    }
};

const speakEval: EvalFunction = {
    name: 'speakEval',
    description: 'Evaluates the macOS text-to-speech speak tool',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Could you please speak the text 'Hello, how are you today?' using the voice 'Samantha' at a rate of -10?");
        return JSON.parse(result);
    }
};

const take_screenshotEval: EvalFunction = {
    name: 'take_screenshot',
    description: 'Evaluates the take_screenshot tool functionality',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please take a fullscreen screenshot in PNG format and save it to /Users/myuser/Desktop/screenshot.png with the cursor hidden.");
        return JSON.parse(result);
    }
};

const select_fileEval: EvalFunction = {
    name: 'select_fileEval',
    description: 'Evaluates the behavior of the select_file tool by verifying its ability to open a file dialog with specified parameters',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Open a file picker dialog with a prompt 'Select an image', default location '~/Pictures', file type filter to .png and .jpg, and allow multiple selections.");
        return JSON.parse(result);
    }
};

const config: EvalConfig = {
    model: openai("gpt-4"),
    evals: [send_notificationEval, prompt_userEval, speakEval, take_screenshotEval, select_fileEval]
};
  
export default config;
  
export const evals = [send_notificationEval, prompt_userEval, speakEval, take_screenshotEval, select_fileEval];