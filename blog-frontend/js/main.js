const API_URL = "http://localhost:5000/api/blogs";

// Fetch and Display Blogs
function fetchBlogs() {
    fetch(API_URL)
        .then(response => response.json())
        .then(blogs => {
            const blogTable = document.getElementById("blogTable");
            blogTable.innerHTML = "";
            blogs.forEach(blog => {
                blogTable.innerHTML += `
                    <tr>
                        <td>${blog.title}</td>
                        <td>${blog.author}</td>
                        <td>${blog.category}</td>
                        <td>${blog.summary || "No summary available"}</td>
                        <td>
                            <button onclick="editBlog('${blog._id}')">Edit</button>
                            <button onclick="deleteBlog('${blog._id}')">Delete</button>
                            <button onclick="generateContent('${blog._id}')">Generate Content</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => console.error("Error fetching blogs:", error));
}

// Handle Form Submission (Create or Update Blog)
document.getElementById("blogForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const blogId = document.getElementById("blogId").value;
    const blogData = {
        title: document.getElementById("title").value,
        author: document.getElementById("author").value,
        category: document.getElementById("category").value,
        summary: document.getElementById("summary").value,  // ✅ Added Summary
        content: document.getElementById("content").value,
    };

    if (blogId) {
        updateBlog(blogId, blogData);
    } else {
        createBlog(blogData);
    }
});

// Create Blog
function createBlog(blogData) {
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData),
    })
    .then(response => response.json())
    .then(() => {
        alert("Blog created successfully!");
        resetForm();
        fetchBlogs();
    })
    .catch(error => console.error("Error creating blog:", error));
}

// Load Blog Data into Form for Editing
function editBlog(blogId) {
    fetch(`${API_URL}/${blogId}`)
        .then(response => response.json())
        .then(blog => {
            document.getElementById("blogId").value = blog._id;
            document.getElementById("title").value = blog.title;
            document.getElementById("author").value = blog.author;
            document.getElementById("category").value = blog.category;
            document.getElementById("summary").value = blog.summary || "";  // ✅ Load Summary
            document.getElementById("content").value = blog.content || "";

            document.getElementById("formHeading").innerText = "Update Blog";
            document.getElementById("submitButton").innerText = "Update Blog";
        })
        .catch(error => console.error("Error fetching blog for update:", error));
}

// Update Blog
function updateBlog(blogId, updatedBlogData) {
    fetch(`${API_URL}/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBlogData), // ✅ Ensure Summary is sent
    })
    .then(response => response.json())
    .then(() => {
        alert("Blog updated successfully!");
        resetForm();
        fetchBlogs();
    })
    .catch(error => console.error("Error updating blog:", error));
}

// Delete Blog
function deleteBlog(blogId) {
    fetch(`${API_URL}/${blogId}`, { method: "DELETE" })
    .then(() => {
        alert("Blog deleted successfully!");
        fetchBlogs();
    })
    .catch(error => console.error("Error deleting blog:", error));
}

// Generate AI Content for Blog
function generateContent(blogId) {
    fetch(`${API_URL}/${blogId}/generate-content`, { method: "POST" })
    .then(response => response.json())
    .then(() => {
        alert("Content generated successfully!");
        fetchBlogs();
    })
    .catch(error => console.error("Error generating content:", error));
}

// Reset Form Fields
function resetForm() {
    document.getElementById("blogForm").reset();
    document.getElementById("blogId").value = "";
    document.getElementById("formHeading").innerText = "Create Blog";
    document.getElementById("submitButton").innerText = "Create Blog";
}

// Fetch blogs when page loads
fetchBlogs();
