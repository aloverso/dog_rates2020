export type StubTokenRepo = {
  save: jest.Mock;
  tokenExists: jest.Mock;
  remove: jest.Mock;
  disconnect: jest.Mock;
};

export const StubTokenRepo = (): StubTokenRepo => ({
  save: jest.fn(),
  tokenExists: jest.fn(),
  remove: jest.fn(),
  disconnect: jest.fn(),
});
