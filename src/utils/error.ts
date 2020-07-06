import {
  AuthenticationError,
  UserInputError,
  ValidationError,
} from 'apollo-server-core';

export enum ErrorString {
  UserNotExists = 'User does not exists',
  UserNotSignedIn = 'User is not signed in',
  PasswordIncorrect = 'Password is not correct',
  EmailForUserExists = 'Email for current user is already signed up.',
  EmailSentFailed = 'Email sent failed',
  EmailNotValid = 'Not a valid email address',
  UrlNotValid = 'Url is not a valid url. It should start with http.',
  FirstLastNotSupported = 'Passing both `first` and `last` is not supported.',
  CursorOrCurrentPageArgNotGivenTogether = 'Cursor and CurrentPage argument should be given together.',
}

export const ErrorUserNotExists =
  (): AuthenticationError => new AuthenticationError(ErrorString.UserNotExists);

export const ErrorUserNotSignedIn =
  (): AuthenticationError => new AuthenticationError(ErrorString.UserNotSignedIn);

export const ErrorPasswordIncorrect =
  (): AuthenticationError => new AuthenticationError(ErrorString.PasswordIncorrect);

export const ErrorEmailForUserExists =
  (): AuthenticationError =>
    new AuthenticationError(ErrorString.EmailForUserExists);

export const ErrorEmailSentFailed =
  (err: Error): Error =>
    new Error(`${ErrorString.EmailSentFailed}\n${err.message}`);

export const ErrorEmailNotValid =
  (): ValidationError =>
    new ValidationError(ErrorString.EmailNotValid);

export const ErrorUrlNotValid =
  (): ValidationError =>
    new ValidationError(ErrorString.UrlNotValid);

export const ErrorFirstLastNotSupported =
  (): AuthenticationError => new AuthenticationError(ErrorString.FirstLastNotSupported);
