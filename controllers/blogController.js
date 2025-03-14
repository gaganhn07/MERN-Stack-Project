const Blog = require("../models/Blog");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create Blog
exports.createBlog = async (req, res) => {
  try {
    const { title, author, category, content, summary, tags, status, featuredImage } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, "-"); // Generate slug from title
    const blog = new Blog({ title, slug, author, category, content, summary, tags, status, featuredImage });
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get All Blogs (with pagination)
exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const blogs = await Blog.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update Blog (Fix: Added author and summary fields)
exports.updateBlog = async (req, res) => {
  try {
    console.log("Received Update Request for ID:", req.params.id);
    console.log("Received Data:", req.body);

    const { title, content, category, status, author, summary } = req.body;
    
    const updateData = { title, content, category, status, author, summary };

    if (title) updateData.slug = title.toLowerCase().replace(/\s+/g, "-");

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { 
      new: true, 
      runValidators: true 
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    console.log("Updated Blog:", blog);
    res.json(blog);
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete Blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: error.message });
  }
};

// Generate AI Content using OpenAI
exports.generateContent = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const response = await openai.completions.create({
      model: "gpt-4",
      prompt: `Generate a blog post about ${blog.title} in the category ${blog.category}.`,
      max_tokens: 500,
    });

    if (!response.choices || response.choices.length === 0) {
      return res.status(500).json({ error: "OpenAI did not return a response" });
    }

    blog.content = response.choices[0].text.trim();
    await blog.save();
    res.json(blog);
  } catch (error) {
    console.error("Error generating AI content:", error);
    res.status(500).json({ error: "AI content generation failed." });
  }
};
