# Kaggle Assignment

This is a small app to fetch data from Kaggle datasets & push the data to a Google Form.

These are the steps:

- Download file from [Kaggle](https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv) containing the most common baby names per year.
- Unzip file and process a chunk of the csv within (500 records).
- Submit every record to a [Google Form](https://docs.google.com/forms/d/12GWPdXfuN8lI1bxu8WB8QrZmUtHs2fHqm2dbZkJtul4/edit) previously created.

## About Playwright Testing
I've been trying to implement this entire process in a sigle test using Playwright, but I'm failing in step 1. Every time I try to download the file from Kaggle the page redirects to login again. I'm going to keep looking for a way to solve this, but for now I can't get the Playwright requirement right.

## Notes about CLI commands
- npm run dev to run all locally

- npm dist:win to create an .exe for windows (this is the only one I tested, since I have a windows machine)
- npm dist:mac to create a .dmg for mac
- npm dist:linux to create an AppImage for linux