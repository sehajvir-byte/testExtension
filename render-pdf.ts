// src/render-pdf.ts

// Placeholder for your real PDF rendering pipeline.
// For now, it just returns the original PDF blob unchanged.
export async function renderPdfPlaceholder(inputPdf: Blob): Promise<Blob> {
  console.log("[InclusiveCanvas] Placeholder renderer received PDF blob:", inputPdf);
  // replace this with a call to the backend
  return inputPdf;
}

import { GoogleGenerativeAI } from "@google/generative-ai";

// You will need a library to convert the resulting HTML back to PDF.
// For client-side: 'jspdf' is common. For server-side: 'puppeteer' or 'html-pdf-node'.
// This example assumes a helper function exists or you handle the HTML rendering.

const API_KEY = "AIzaSyC4wI3BIGI0y8Kt1XouPwa_znJHlYPyPv4"; // Securely manage this (e.g., process.env.API_KEY)

export async function renderPdf(inputPdf: Blob): Promise<TrustedHTML> {
  console.log("[InclusiveCanvas] Processing PDF for ADHD optimization...");

  try {
    // 1. Initialize Gemini Client
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Gemini 1.5 Flash is multimodal and can read PDFs directly
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // 2. Convert Blob to Base64 (Required for the API)
    const base64Data = await blobToBase64(inputPdf);

    // 3. Define the ADHD-friendly System Prompt
    const prompt = `You are an expert Web Accessibility Specialist and UI Designer focusing on neurodiversity. Your task is to refactor the provided HTML content to be highly readable for users with ADHD, using "Bionic Reading" techniques and color coding.

**CRITICAL CONTENT RULES:**
1. You must NOT change, delete, or rephrase any of the original body text. The words must remain exactly as they are.
2. You are only allowed to change the HTML structure (tags) and add inline CSS styles.
3. You may generate new text ONLY for the "TL;DR" summary.

**FORMATTING INSTRUCTIONS:**
1. **TL;DR Section:** Analyze the content and generate a 2-3 sentence summary. Place this at the very top inside a \`<div>\` with a distinct background color.
2. **Bionic Reading:** Bold ALL \`Key Phrases and Takeaways, Important Terms, Subheadings, Actionable Data, Questions or Hooks\`. Always want them anchors the eye.
3. **Chunking:** Break any paragraph longer than 3 sentences into smaller, separate paragraphs.
4. **Lists:** If you detect a list of items in the text, convert them into \`<ul>\` or \`<ol>\` lists.

**VISUAL/COLOR INSTRUCTIONS (Use Inline CSS):**
*   **Background:** Use #fdfbf7 as the main container to reduce eye strain
*   **Text Color:** Use one of the \`#1B4F72, #117A65, #5B2C6F, #A04000, #2F4F4F\` as text color, and ALWAYS change the color applied between EVERY topic.
*   **Bionic Bold Color:** Make the \`<strong>\` parts use #1a202c to make them pop without being distracting.
*   **TL;DR Box:** Use a soft pastel background (e.g., \`#e6fffa\`) with a dark border.

**OUTPUT:**
Return ONLY the raw HTML code. Do not include markdown code blocks (\`\`\`html) or conversational filler.`;
    // 4. Call the API (Multimodal: Text + PDF)
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf",
        },
      },
    ]);

    const adhdHtml = result.response.text();
//     const adhdHtml: string = `<div style="background-color: #e6fffa; border: 1px solid #1a1a1a; padding: 10px; margin-bottom: 15px;">
//   <strong>TL;DR:</strong> This assignment focuses on practical skills for the course, including connecting to the student server, using bash scripting for file manipulation and testing, and understanding C compilation flags. You'll create a unique codeword, a script to describe test cases, and another script to run commands against test files and compare outputs.
// </div>
// <div style="background-color: #fdfbf7; padding: 15px; border-radius: 8px;">
//   <p style="color: #1B4F72;"><strong>CMPUT275—Assignment 1 (Winter 2026)</strong><br>
//   <strong>R. Hackman</strong><br>
//   <strong>Due Date: Friday January 30th, 8:00PM</strong></p>
//   <p style="color: #1B4F72;">Per course policy you are allowed to engage in <strong>reasonable collaboration</strong> with your classmates.</p>
//   <p style="color: #1B4F72;">You must include in the comments of your assignment solutions a <strong>list of any students you collaborated with</strong> on that particular question.</p>
//   <p style="color: #1B4F72;">For assignment questions we will give you a <strong>sample executable</strong> — this is our solution to the problem which you will be tested against.</p>
//   <p style="color: #1B4F72;">You should use this assignment question to <strong>check what the expected output is</strong>.</p>
//   <p style="color: #1B4F72;">If you ever have a question “What should our program do when XYZ” the answer is <strong>what does the sample executable do?</strong></p>
//   <p style="color: #1B4F72;">With the notable exception of <strong>invalid input</strong>.</p>
//   <p style="color: #1B4F72;">Breaking the rules of what the program expects is considered invalid input and wouldn’t be a valid test case unless we explicitly told you what your program should do to handle such a problem.</p>
//   <p style="color: #1B4F72;">Note: These sample executables are compiled on the student environment — that means they are <strong>only guaranteed to work on that environment</strong>.</p>
//   <p style="color: #1B4F72;">They likely will not work on your local machine, you should <strong>use them on the student environment</strong> if this is the case, which is where you should be testing your own code anyway.</p>
//   <p style="color: #1B4F72;">Most of the questions of this assignment are <strong>steps to building a larger script</strong> which will help you throughout this course with testing your own assignment code.</p>
//   <p style="color: #1B4F72;">We suggest you <strong>start early</strong> so that getting stuck on an early question does not mean you won’t be able to finish later questions.</p>
//   <p style="color: #1B4F72;">Finally, in all questions in which C programming is performed the student must compile with the flags <strong>-Wall -Wvla and -Werror</strong>, which turn on some important warnings as well as treat warnings as errors, which means code with warnings will not compile.</p>
//   <p style="color: #1B4F72;">This is how your code will be compiled when we are testing it, and if your code does not compile then your solution cannot be executed which results in a zero.</p>
//   <p style="color: #1B4F72;">As such, <strong>make sure you are always compiling with these flags</strong>.</p>
//   <p style="color: #1B4F72;">In order to help you do so, you may want to add the following line to the bottom of your .bashrc file in your home directory on the student server:</p>
//   <p style="color: #1B4F72;"><code>alias gcc="gcc -Wall -Wvla -Werror"</code></p>
//   <h2 style="color: #117A65;">1. Connecting to the Student Server</h2>
//   <p style="color: #117A65;">This question is about <strong>connecting to the student server</strong> and running programs on it.</p>
//   <p style="color: #117A65;">This is essential to this course as you must always <strong>test your assignment solutions on the student server</strong> before submitting to make sure they work correctly!</p>
//   <p style="color: #117A65;">First, you must <strong>connect to the student server</strong>. As discussed in class you can connect to the student server using the <code>ssh</code> command.</p>
//   <p style="color: #117A65;">Once you have connected to the student server you should <strong>clone the course repository</strong> on the student server if you have not done so already, so that you have access to it there as well as your local machine.</p>
//   <p style="color: #117A65;">Inside the assignment 1 folder there is a program named <code>generateCodeword</code>.</p>
//   <p style="color: #117A65;">You must <strong>run this program on the student server</strong>, and if executed correctly it will print out a single word.</p>
//   <p style="color: #117A65;">Make a plaintext file named <code>a1q1.txt</code> that contains the output of the <code>generateCodeword</code> program and <strong>include that text file in your submission</strong>.</p>
//   <p style="color: #117A65;">This code word is unique for each student, so you cannot have a friend run the program for you.</p>
//   <p style="color: #117A65;">The purpose of this question is to make sure you are able to <strong>connect to the student server</strong> so that you are set up to properly test assignment solutions!</p>
//   <p style="color: #117A65;">Deliverables: For this question include in your final submission zip your bash script file named <code>a1q1.txt</code></p>
//   <p style="color: #117A65;">-- 1 of 7 --</p>
//   <h2 style="color: #5B2C6F;">2. Writing a Bash Script: testDescribe</h2>
//   <p style="color: #5B2C6F;">This question is about <strong>writing a bash script</strong> — you should not write any C code for this question.</p>
//   <p style="color: #5B2C6F;">In this question you are writing a bash script named <code>testDescribe</code> which expects one command line argument which is a <strong>filepath</strong>.</p>
//   <p style="color: #5B2C6F;">The filepath <code>testDescribe</code> receives should be to a text file whose contents are a series of strings separated by whitespace. We’ll call this file a <strong>“test set file”</strong>.</p>
//   <p style="color: #5B2C6F;">Here is an example of the contents of a test set file named <code>set1.txt</code>:</p>
//   <ul style="color: #5B2C6F;">
//     <li>test1 /home/rob/foo/test2</li>
//     <li>./test3</li>
//     <li>test4</li>
//   </ul>
//   <p style="color: #5B2C6F;">The strings inside the test set file we’ll call <strong>file stems</strong>.</p>
//   <p style="color: #5B2C6F;">These strings are meant to represent every part of a filepath except for the file extension.</p>
//   <p style="color: #5B2C6F;">You’ll notice that the contents can be absolute or relative paths — this should not affect how you write your script.</p>
//   <p style="color: #5B2C6F;">Your script must iterate through the contents of the test set file and for each file stem it should perform the following process. Note that in each place the process says stem it means each of the strings contained within the test set file.</p>
//   <ul style="color: #5B2C6F;">
//     <li>(a) If no command line argument is given for the test set file print a <strong>usage message to stderr</strong>.</li>
//     <li>(b) If the command line argument is given, then it should be assumed that it is a test set file. For each of the strings in the test set files (which represent file stems) you should perform the following process:
//       <ul style="color: #5B2C6F;">
//         <li>i. Print out a message of the form <strong>‘Description for test case &lt;stem&gt;:’</strong> followed by a newline.</li>
//         <li>ii. If the file <code>stem.desc</code> does not exist print out the message <strong>‘&lt;stem&gt;: No test description’</strong>.</li>
//         <li>iii. If the file <code>stem.desc</code> does exist print out the <strong>contents of the file stem.desc</strong>.</li>
//         <li>iv. In the above steps when a string literal contains ‘&lt;stem&gt;’ note that it means to <strong>replace that with the actual stem currently being processed</strong>.</li>
//       </ul>
//     </li>
//   </ul>
//   <p style="color: #5B2C6F;">For example consider your current working directory contains the file <code>test1.desc</code> with the following contents:</p>
//   <p style="color: #5B2C6F;">This test uses negative inputs</p>
//   <p style="color: #5B2C6F;">And your current working directory contains the file <code>test3.desc</code> with the following contents:</p>
//   <p style="color: #5B2C6F;">This test using zero as an input</p>
//   <p style="color: #5B2C6F;">And your file system contains the file <code>/home/rob/foo/test2.desc</code> with the following contents:</p>
//   <p style="color: #5B2C6F;">This test uses positive inputs</p>
//   <p style="color: #5B2C6F;">Then the output of executing your script as follow <code>$ ./testDescribe set1.txt</code> would be</p>
//   <p style="color: #5B2C6F;">Description for test case test1:<br>
//   This test uses negative inputs<br>
//   Description for test case /home/rob/cmput275/a1/testDesc/test2:<br>
//   This test uses positive inputs<br>
//   Description for test case test3:<br>
//   This test using zero as an input<br>
//   Description for test case test4:<br>
//   test4 No test description</p>
//   <p style="color: #5B2C6F;">Hint: You may need some conditions we didn’t talk about in class for your if statements in bash.</p>
//   <p style="color: #5B2C6F;">Here’s a useful website with lots of bash tips <strong>https://devhints.io/bash</strong>.</p>
//   <p style="color: #5B2C6F;">Deliverables: For this question include in your final submission zip your bash script file named <code>testDescribe</code></p>
//   <p style="color: #5B2C6F;">-- 2 of 7 --</p>
//   <h2 style="color: #A04000;">3. Writing a Bash Script: runInTests</h2>
//   <p style="color: #A04000;">This question is about <strong>writing a bash script</strong> — you should not write any C code for this question.</p>
//   <p style="color: #A04000;">In this question you will be writing a bash script <code>runInTests</code> which expects two command line arguments, the first command line argument is a <strong>command to run</strong> (which may be a path to a program), and the second command line argument is a <strong>test set file</strong> (as described in question 1).</p>
//   <p style="color: #A04000;">Below is an example run of your script:</p>
//   <p style="color: #A04000;"><code>./runInTests wc wc_set.txt</code></p>
//   <p style="color: #A04000;">Consider the file <code>wc_set.txt</code> contains the following:</p>
//   <ul style="color: #A04000;">
//     <li>wcTest1</li>
//     <li>wcTest2</li>
//   </ul>
//   <p style="color: #A04000;">Your script <code>runInTests</code> will iterate through the file stems in the test set file and perform the following set of steps for each file stem, note in each step you should consider stem is a variable that represents any given file stem:</p>
//   <ul style="color: #A04000;">
//     <li>(a) Run the command given to your script while <strong>redirecting input from the file stem.in</strong>.</li>
//     <li>(b) <strong>Compare the output</strong> from that execution of the command to the contents of the file <code>stem.out</code>.</li>
//     <li>(c) If the output does not differ, then output <strong>‘Test stem passed’</strong>.</li>
//     <li>(d) If the output does differ, then output <strong>‘Test stem failed’</strong>, followed on the next line by <strong>‘Expected output:’</strong>, followed on the next line by the contents of <code>stem.out</code>, followed on the next line by <strong>‘Actual output:’</strong>, followed on the next line by the output produced by running the given command with the given input file.</li>
//   </ul>
//   <p style="color: #A04000;">Try out sample executable with the sample command above with the provided files to see a sample output.</p>
//   <p style="color: #A04000;">Note: If your program creates any files they must be <strong>temporary files</strong>. They must also be <strong>deleted</strong> once you are finished with them.</p>
//   <p style="color: #A04000;">Hint 1: Consider using the <code>diff</code> command to help you solve this problem.</p>
//   <p style="color: #A04000;">Remember you can read the exit status of the previous command you executed with <code>$?</code> — read the man</p>
//   <p style="color: #A04000;">-- 3 of 7 --</p>
// </div>`;
    console.log("[InclusiveCanvas] Generated HTML content.");

    // Do we still want that?

    // 5. Convert the generated HTML string back to a PDF Blob
    // Since LLMs return text, we must render it to PDF.
    // const outputPdfBlob = await convertHtmlToPdfBlob(adhdHtml);

    return adhdHtml;

  } catch (error) {
    console.error("Error generating ADHD PDF:", error);
    throw error;
  }
}

// --- Helper Functions ---

/**
 * Converts a Blob to a Base64 string (without the data URL prefix)
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove "data:application/pdf;base64," prefix
      const base64 = result.split(",")[1]; 
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * MOCK FUNCTION: Converts HTML string to PDF Blob.
 * In a real app, use 'jspdf' (client) or 'puppeteer' (server).
 */
// async function convertHtmlToPdfBlob(htmlContent: string): Promise<Blob> {
//   // Example logic using a hypothetical library:
//   // const doc = new jsPDF();
//   // doc.html(htmlContent, { callback: (doc) => doc.save() });
  
//   console.log("Converting HTML to PDF...");
  
//   // For this example, we return the input blob to satisfy the type signature,
//   // but in production, this would be the new generated PDF.
//   return new Blob([htmlContent], { type: 'application/pdf' }); 
// }