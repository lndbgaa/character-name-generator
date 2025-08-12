import multer from "multer";

const storage = multer.memoryStorage();

const jsonUpload = multer({ storage }).single("json");

export default jsonUpload;
