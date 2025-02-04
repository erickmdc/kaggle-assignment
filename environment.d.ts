declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      KAGGLE_NAME: string;
      KAGGLE_PASSWORD: string;
      ZIP_PATH: string;
      CSV_PATH: string;
      DATABASE_HOST: string;
      DATABASE_NAME: string;
      DATABASE_USER: string;
      DATABASE_PASSWORD: string;
    }
  }
}

export {};