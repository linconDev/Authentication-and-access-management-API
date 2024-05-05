import { LoggerService } from './logger.service';
import * as winston from 'winston';

jest.mock('winston', () => {
  const mTransports = {
    Console: jest.fn(),
    File: jest.fn(),
  };
  return {
    createLogger: jest.fn().mockReturnValue({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    }),
    transports: mTransports,
  };
});

describe('LoggerService', () => {
  let loggerService: LoggerService;
  let mockLogger;

  beforeEach(() => {
    loggerService = new LoggerService();
    mockLogger = winston.createLogger();
  });

  it('should log info level messages', () => {
    const message = 'Info message';
    loggerService.log(message);
    expect(mockLogger.info).toHaveBeenCalledWith(message);
  });

  it('should log error level messages', () => {
    const message = 'Error message';
    const trace = 'Stack trace';
    loggerService.error(message, trace);
    expect(mockLogger.error).toHaveBeenCalledWith(message, { trace });
  });

  it('should log warnings', () => {
    const message = 'Warning message';
    loggerService.warn(message);
    expect(mockLogger.warn).toHaveBeenCalledWith(message);
  });

  it('should log debug messages', () => {
    const message = 'Debug message';
    loggerService.debug(message);
    expect(mockLogger.debug).toHaveBeenCalledWith(message);
  });
});
