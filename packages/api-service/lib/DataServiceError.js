class DataServiceError extends Error {
  constructor({ message, status }) {
    super(message);

    this.name = 'ServiceError';
    this.status = DataServiceError.statusCodes[status] || null;
  }
}

DataServiceError.statusCodes = {
  DATA_API_NOT_FOUND_DATA: 'DATA_API_NOT_FOUND_DATA',
  DATA_API_BAD_REQUEST: 'DATA_API_BAD_REQUEST',
  DATA_API_REJECT_REQUEST: 'DATA_API_REJECT_REQUEST',
  DATA_API_UNAVAILABLE: 'DATA_API_UNAVAILABLE',
};

module.exports = { DataServiceError };
