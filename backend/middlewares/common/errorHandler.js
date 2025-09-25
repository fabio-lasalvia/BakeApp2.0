
function errorHandler(error, request, response, next) {
    switch (error.status) {
        case 400:
            return response.status(400).json({ message: error.message || "Bad Request" });
        case 401:
            return response.status(401).json({ message: "Unauthorized" });
        case 403:
            return response.status(403).json({ message: "Forbidden" });
        case 404:
            return response.status(404).json({ message: "Not Found" });
        case 409:
            return response.status(409).json({ message: "Conflict" });
        case 422:
            return response.status(422).json({ message: "Unprocessable Entity" });
        default:
            return response.status(error.status || 500).json({
                message: error.message || "Internal Server Error"
            });
    }
}

export default errorHandler