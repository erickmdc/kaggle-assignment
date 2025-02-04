import { RowDataPacket } from "mysql2";

export interface IBabyName extends RowDataPacket {
  id: number;
  name: string;
  year_of_birth: number;
  sex: string;
  number: number;

  created_at: Date;
  submission_status: SubmissionStatus;
}

export enum SubmissionStatus {
  NOT_SUBMITTED = 0,
  SUBMITTING = 1,
  SUBMITTED = 2,
  ERROR_SUBMITING = 99
}

export interface IBabyNameCsv {
  YearOfBirth: number;
  Name: string;
  Sex: string;
  Number: number;
}