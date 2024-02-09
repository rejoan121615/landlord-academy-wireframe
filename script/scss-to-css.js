const { readFileSync, writeFileSync, readdirSync } = require('fs');
const sass = require('sass');
const chokidar = require('chokidar');

// Input folder path containing HTML files
const htmlFolderPath = './'; // Adjust this to your folder path
const scssFilePath = 'scss/style.scss'; // Path to your SCSS file

// Function to compile SCSS and embed CSS into HTML
function compileAndEmbedHTML(filePath) {
    try {
        // Compile SCSS to CSS
        const result = sass.renderSync({
            file: scssFilePath,
            outputStyle: 'compressed' // You can change this to 'expanded' if you want readable CSS
        });
        const compiledCss = result.css.toString();

        // Read HTML content
        let htmlContent = readFileSync(filePath, 'utf8');

        // Embed compiled CSS into the <style> tag within the <head> of HTML
        htmlContent = htmlContent.replace(
            /<style[^>]*>.*?<\/style>/gs,
            `<style>${compiledCss}</style>`
        );

        // Write updated HTML content back to the file
        writeFileSync(filePath, htmlContent, 'utf8');

        console.log(`SCSS compiled and CSS embedded successfully in ${filePath}.`);
    } catch (error) {
        console.error(`Error compiling SCSS: ${error.message}`);
    }
}

// Function to compile SCSS
function compileSCSS() {
    console.log('Compiling SCSS...');
    try {
        // Compile SCSS to CSS
        const result = sass.renderSync({
            file: scssFilePath,
            outputStyle: 'compressed' // You can change this to 'expanded' if you want readable CSS
        });
        const compiledCss = result.css.toString();

        // Update all HTML files with the new compiled CSS
        const htmlFiles = readdirSync(htmlFolderPath).filter(file => file.endsWith('.html'));
        htmlFiles.forEach(file => {
            compileAndEmbedHTML(`${htmlFolderPath}/${file}`);
        });

        console.log('SCSS compiled and CSS embedded successfully in all HTML files.');
    } catch (error) {
        console.error(`Error compiling SCSS: ${error.message}`);
    }
}

// Initial compilation and embedding for all HTML files in the folder
const htmlFiles = readdirSync(htmlFolderPath).filter(file => file.endsWith('.html'));
htmlFiles.forEach(file => {
    compileAndEmbedHTML(`${htmlFolderPath}/${file}`);
});

// Watch for changes in SCSS file
chokidar.watch(scssFilePath).on('change', () => {
    console.log('SCSS file changed. Recompiling and embedding CSS...');
    compileSCSS();
});

// Watch for changes in HTML files within the folder
chokidar.watch(htmlFolderPath).on('change', (filePath) => {
    if (filePath.endsWith('.html')) {
        console.log(`HTML file changed: ${filePath}. Recompiling and embedding CSS...`);
        compileAndEmbedHTML(filePath);
    }
});

// Watch for newly added HTML files within the folder
chokidar.watch(htmlFolderPath).on('add', (filePath) => {
    if (filePath.endsWith('.html')) {
        console.log(`New HTML file added: ${filePath}. Compiling and embedding CSS...`);
        compileAndEmbedHTML(filePath);
    }
});
