//Sql queries
export const BULK_INSERT_QUERY = 'INSERT INTO baby_names (name, year_of_birth, sex, number) VALUES ?';
export const SELECT_QUERY = 'SELECT id, name, year_of_birth, sex, \`number\`, submission_status FROM baby_names WHERE submission_status = ? LIMIT ?';
export const UPDATE_SUBMISSION_STATUS_QUERY = 'UPDATE baby_names SET submission_status = ? WHERE id = ?';

//Kaggle urls
export const KAGGLE_URL = 'https://www.kaggle.com/';
export const KAGGLE_DATASET_URL = 'https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv';

//Google Form urls
export const SUBMIT_FORM_URL = (yearOfBirth: number, name: string, sex: string, number: number) => `https://docs.google.com/forms/d/e/1FAIpQLScgU3nOl5T92pvKQi6ATl-Rz83CgFiMMAEyRTBFcLOSu62j4A/formResponse?usp=pp_url&entry.785709935=${yearOfBirth}&entry.1978853702=${name}&entry.663394750=${sex}&entry.119008361=${number}&submit=Submit`;
export const PARTICIPANT_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScgU3nOl5T92pvKQi6ATl-Rz83CgFiMMAEyRTBFcLOSu62j4A/viewform';

export const USER_DATA_DIR = 'C:\\Usuários\\emc7\\AppData\\Local\\Google\\Chrome\\User Data';