## [Tutorials](https://developer.puter.com/tutorials/)

# Add Upload to Your Website for Free

This tutorial will show you how to use Puter.js to add file upload capabilities to your web application for free, without any backend or server setup. Using Puter.js, you can easily allow users to upload files to cloud storage directly from their browser. Puter.js can serve as a powerful, free alternative to traditional file upload solutions such as Amazon S3, Google Cloud Storage, Firebase Storage, or custom server-side implementations.

## Getting Started

Puter.js works out of the box without any additional setup or configuration. To start using Puter.js for file uploads, you only need to include the Puter.js script in your HTML file, either in the `<head>` or `<body>` section:

```html hljs language-xml
<script src="https://js.puter.com/v2/"></script>

```

That's it! You're now ready to add file upload capabilities to your website using Puter.js. No need to set up a server, manage storage, or worry about API keys.

## Example 1Basic File Upload

Let's start with a simple example that allows users to upload a single file. This example demonstrates how to use Puter.js to perform basic file uploads. You can select a file using the file input, and then click the "Upload" button to upload it to the cloud storage:

```html hljs language-xml
<html>
<body>
    <input type="file" id="file-input">
    <button id="upload-button">Upload</button>
    <div id="result"></div>

    <script src="https://js.puter.com/v2/"></script>
    <script>
        document.getElementById('upload-button').addEventListener('click', async () => {
            const fileInput = document.getElementById('file-input');
            const resultDiv = document.getElementById('result');

            if (fileInput.files.length > 0) {
                try {
                    const uploadedFile = await puter.fs.upload(fileInput.files);
                    resultDiv.innerHTML = `File uploaded successfully! Path: ${uploadedFile.path}`;
                } catch (error) {
                    resultDiv.innerHTML = `Error uploading file: ${error.message}`;
                }
            } else {
                resultDiv.innerHTML = 'Please select a file to upload.';
            }
        });
    </script>
</body>
</html>

```

Let's break down the code:

```html hljs language-xml
<input type="file" id="file-input">

```

This creates a standard file input field that allows users to select files from their device. The 'file' type specifically enables file selection functionality.

```html hljs language-xml
<button id="upload-button">Upload</button>

```

This creates a clickable button that will trigger our upload process.

```html hljs language-xml
<div id="result"></div>

```

This empty div will be used to display feedback to the user about the upload process - success messages, errors, or instructions.

```html hljs language-xml
<script src="https://js.puter.com/v2/"></script>

```

This line imports the Puter.js library, giving us access to all its file handling and cloud storage capabilities.

Now for the JavaScript:

```javascript hljs
document.getElementById('upload-button').addEventListener('click', async () => {

```

This sets up an event listener on our upload button. The async keyword is necessary because file uploads are asynchronous operations.

```javascript hljs
const fileInput = document.getElementById('file-input');
const resultDiv = document.getElementById('result');

```

These lines get references to our HTML elements so we can access the selected file and update the result message.

```javascript hljs
if (fileInput.files.length > 0) {

```

This checks if the user has actually selected any files. The files property is an array-like object containing all selected files.

```javascript hljs
const uploadedFile = await puter.fs.upload(fileInput.files);

```

This is where the actual upload happens. The `puter.fs.upload()` method handles the entire upload process to Puter's cloud storage. The await keyword makes our code wait for the upload to complete before continuing.

```javascript hljs
resultDiv.innerHTML = `File uploaded successfully! Path: ${uploadedFile.path}`;

```

After a successful upload, this displays a success message showing where the file was stored in the cloud. The `uploadedFile.path` gives us the file's location in Puter's storage system.

```javascript hljs
} catch (error) {
    resultDiv.innerHTML = `Error uploading file: ${error.message}`;
}

```

This error handling code catches any problems during the upload (like network issues or file size limits) and displays the error message to the user.

```javascript hljs
} else {
    resultDiv.innerHTML = 'Please select a file to upload.';
}

```

If the user clicks upload without selecting a file, this provides feedback asking them to select a file first.

That's it! You now have a free and powerful file upload solution using Puter.js. This allows you to add file upload capabilities to your web applications without worrying about server-side implementation or storage costs.

## Additional Features

Puter.js offers many more features, including [cloud database](https://developer.puter.com/tutorials/add-a-cloud-key-value-store-to-your-app-a-free-alternative-to-dynamodb), hosting static websites, and [AI-powered services](https://developer.puter.com/tutorials/free-unlimited-openai-api). Explore the [Puter.js documentation](https://docs.puter.com/) to discover all the possibilities and start building powerful, serverless web applications with ease!

## Related

- [Free, Unlimited OpenAI API](https://developer.puter.com/tutorials/free-unlimited-openai-api)
- [Free, Unlimited Claude API](https://developer.puter.com/tutorials/free-unlimited-claude-35-sonnet-api)
- [Add a Cloud Key-Value Store to Your App: A Free Alternative to DynamoDB](https://developer.puter.com/tutorials/add-a-cloud-key-value-store-to-your-app-a-free-alternative-to-dynamodb)

## Ready to Build Your First App?

Start creating powerful web applications with Puter.js today!

[Get Started Now](https://docs.puter.com/getting-started/)

[Read the Docs](https://docs.puter.com/)• [Try the Playground](https://docs.puter.com/playground/)