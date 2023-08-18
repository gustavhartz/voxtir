import jwt from 'jsonwebtoken';

import {
  generateProjectSharingToken,
  projectSharingJWTRes,
  verifyProjectSharingToken,
} from './jwt.js'; // Update the import path to match your actual file structure

// Mocking jwt.sign and jwt.verify
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('generateProjectSharingToken', () => {
  it('generates a token with the given projectId', () => {
    const projectId = 'project123';
    const token = generateProjectSharingToken(projectId);
    console.log(token);
    expect(jwt.sign).toHaveBeenCalledWith(
      { projectId },
      expect.any(String),
      expect.any(Object)
    );
  });
});

describe('verifyProjectSharingToken', () => {
  it('verifies a token and returns the decoded payload', () => {
    const mockDecodedToken: projectSharingJWTRes = {
      projectId: 'project123',
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 3600, // Expiring in 1 hour
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

    const token = 'mockedToken';
    const decoded = verifyProjectSharingToken(token);

    expect(decoded).toEqual(mockDecodedToken);
    expect(jwt.verify).toHaveBeenCalledWith(
      token,
      expect.any(String),
      undefined
    );
  });
});

// Add more tests for different scenarios as needed
