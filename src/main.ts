import { app, BrowserWindow } from 'electron';
import playwright from 'playwright';
import AdmZip from 'adm-zip';
import csv from 'csv-parser';
import fs from 'fs';
import mysql, { ResultSetHeader } from 'mysql2/promise';
import { 
  BULK_INSERT_QUERY, SELECT_QUERY, UPDATE_SUBMISSION_STATUS_QUERY,
  PARTICIPANT_FORM_URL, SUBMIT_FORM_URL,
  KAGGLE_URL, KAGGLE_DATASET_URL } from './constraints';
import { IBabyNameCsv, SubmissionStatus, IBabyName } from './types';
import env from './env';
import path from 'path';

app.on('ready', async () => {
  try {
    const browser = await playwright.chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const fileName = await getDataFromKaggle(page);

    await unzipFile(fileName);
    await processFile();

    await submitData(page);
  } catch (error) {
    console.log(error);
  } finally {
    process.exit();
  }
});


const getDataFromKaggle = async (page: playwright.Page): Promise<string> => {

  await page.goto(KAGGLE_URL);
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'Sign In with Email' }).click();
  await page.getByLabel('Email / Username').fill(env.KAGGLE_NAME);
  await page.getByRole('textbox', { name: 'Password' }).fill(env.KAGGLE_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForSelector("h1:has-text('Welcome, Erick Carvalho!')", { timeout: 5000 });

  var welcomeTexts = await page.getByText('Welcome, Erick Carvalho!').allTextContents();

  if (!welcomeTexts.length)
    throw new Error('Login error.');

  await page.goto(KAGGLE_DATASET_URL);

  const downloadEvent = page.waitForEvent("download");
  await page.getByRole('button', { name: 'Download' }).nth(1).click();
  const download = await downloadEvent;

  const downloadError = await download.failure();

  if (downloadError)
    throw new Error(`Error downloading file: ${downloadError}`);

  const fileName = download.suggestedFilename();
  await download.saveAs(path.join(env.ZIP_PATH, fileName));

  return fileName;
}

const unzipFile = async (fileName: string) => {
  var unzipPromise = new Promise<void>((resolve, reject) => {
    
    const zip = new AdmZip(path.join(env.ZIP_PATH, fileName));
    zip.extractAllToAsync(env.CSV_PATH, true, undefined, err => {
      if (err) reject(err);

      console.log('file unzipped');
      resolve();
    });
  })

  return await unzipPromise;
}

const processFile = async (initialChunk = 0): Promise<void> => {
  let rows: Array<IBabyNameCsv> = [];
  let chunkCount = 1;
  const chunkSize = 10_000;

  const fileNames = fs.readdirSync(env.CSV_PATH);

  if (!fileNames.length)
    throw new Error('Csv file not found.');

  var stream = fs.createReadStream(path.join(env.CSV_PATH, fileNames[0]));

  for await (const row of stream.pipe(csv())) {
    rows.push(row);

    if (rows.length === chunkSize) {

      if (chunkCount >= initialChunk) {
        stream.pause();
        await saveData(rows);
        stream.resume();
      }

      console.log(`Chunk ${chunkCount++}`);
      rows = [];
    }
  }

  if (rows.length && chunkCount >= initialChunk) {
    await saveData(rows);
    console.log(`Chunk ${chunkCount} (last chunk)`);
  }
}

const submitData = async (page: playwright.Page, useApi = true): Promise<void> => {

  const data = await getData();

  //Doing it synchronously so Form doesn't get overloaded
  for (const row of data) {
    const {
      id,
      year_of_birth: yearOfBirth,
      name,
      number,
      sex
    } = row;

    await updateSubmissionStatus(id, SubmissionStatus.SUBMITTING);

    let finalStatus = SubmissionStatus.SUBMITTED;

    try {
      console.log(`Submitting data to Google Form. Row Id: ${id}.`);

      if (useApi)
        await fetch(SUBMIT_FORM_URL(yearOfBirth, name, sex, number));
      else {
        await submitDataByWeb(page, { name, yearOfBirth, number, sex });
      }

    } catch (error) {
      console.log(`Error submitting row id: ${id} to Form. ${error}`);
      finalStatus = SubmissionStatus.ERROR_SUBMITING;
    } finally {
      await updateSubmissionStatus(id, finalStatus);
    }
  }
}

const submitDataByWeb = async (page: playwright.Page, row: { name: string; yearOfBirth: number; sex: string; number: number }): Promise<void> => {

  if (page.url() != PARTICIPANT_FORM_URL)
    await page.goto(PARTICIPANT_FORM_URL);

  await page.fill('input:below(:has-text("Year of Birth"))', row.yearOfBirth.toString());
  await page.fill('input:below(:has-text("Name"))', row.name.toString());
  await page.fill('input:below(:has-text("Sex"))', row.sex.toString());
  await page.fill('input:below(:has-text("Number"))', row.number.toString());

  await page.getByRole("button").and(page.locator("[aria-label=Submit]")).click();

  await page.goto(PARTICIPANT_FORM_URL);
}

const getMySqlConnection = async () => {
  return await mysql.createConnection({
    host: env.DATABASE_HOST,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME
  });
}

const saveData = async (rows: Array<IBabyNameCsv>) => {
  const connection = await getMySqlConnection();

  const rowsToInsert = rows.map(row => [row.Name, row.YearOfBirth, row.Sex, row.Number]);

  await connection.query<ResultSetHeader>(BULK_INSERT_QUERY, [rowsToInsert]);
  connection.destroy();
}

const getData = async (topCount = 500, submissionStatus = SubmissionStatus.NOT_SUBMITTED) => {
  const connection = await getMySqlConnection();
  const [babyNames] = await connection.query<IBabyName[]>(SELECT_QUERY, [submissionStatus, topCount]);
  connection.destroy();
  return babyNames;
}

const updateSubmissionStatus = async (id: number, submissionStatus: SubmissionStatus) => {
  const connection = await getMySqlConnection();
  await connection.query<ResultSetHeader>(UPDATE_SUBMISSION_STATUS_QUERY, [submissionStatus, id]);
  connection.destroy();
}