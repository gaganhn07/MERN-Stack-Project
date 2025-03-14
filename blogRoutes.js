const express = require("express");
const { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog, generateContent } = require("../controllers/blogController");
const router = express.Router();

router.post("/blogs", createBlog);
router.get("/blogs", getBlogs);
router.get("/blogs/:id", getBlogById);
router.put("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);
router.post("/blogs/:id/generate-content", generateContent);

module.exports = router;
