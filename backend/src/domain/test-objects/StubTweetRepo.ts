export type StubTweetRepo = {
  save: jest.Mock;
  findAll: jest.Mock;
  update: jest.Mock;
  findById: jest.Mock;
  disconnect: jest.Mock;
};

export const StubTweetRepo = (): StubTweetRepo => ({
  save: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  disconnect: jest.fn(),
});
