export type StubTokenService = {
  generate: jest.Mock;
  validate: jest.Mock;
};

export const StubTokenService = (): StubTokenService => ({
  generate: jest.fn(),
  validate: jest.fn(),
});
