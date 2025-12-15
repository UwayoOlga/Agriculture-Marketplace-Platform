import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  Avatar,
  IconButton,
  CircularProgress,
  Paper,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
  Delete as DeleteIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useSnackbar } from 'notistack';

const Forum = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [image, setImage] = useState(null);

  const [comments, setComments] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [newComments, setNewComments] = useState({});

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/forum/posts/');
      setPosts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      enqueueSnackbar('Failed to load forum posts', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchComments = async (postId) => {
    try {
      const response = await apiClient.get(`/forum/posts/${postId}/comments/`);
      setComments(prev => ({ ...prev, [postId]: response.data }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleToggleComments = (postId) => {
    setExpandedComments(prev => {
      const newState = { ...prev, [postId]: !prev[postId] };
      if (newState[postId] && !comments[postId]) {
        fetchComments(postId);
      }
      return newState;
    });
  };

  const handleNewPostChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      if (image) {
        formData.append('image', image);
      }

      await apiClient.post('/forum/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      enqueueSnackbar('Post created successfully!', { variant: 'success' });
      setNewPost({ title: '', content: '' });
      setImage(null);
      setShowNewPostForm(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      enqueueSnackbar('Failed to create post', { variant: 'error' });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await apiClient.delete(`/forum/posts/${postId}/`);
      setPosts(prev => prev.filter(p => p.id !== postId));
      enqueueSnackbar('Post deleted', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting post:', error);
      enqueueSnackbar('Failed to delete post', { variant: 'error' });
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) return;
    try {
      const response = await apiClient.post(`/forum/posts/${postId}/like/`);
      const { liked, likes_count } = response.data;

      setPosts(prevPosts => prevPosts.map(post =>
        post.id === postId
          ? { ...post, is_liked: liked, likes_count: likes_count }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const content = newComments[postId]?.trim();
    if (!content) return;

    try {
      await apiClient.post(`/forum/posts/${postId}/comments/`, { content });
      enqueueSnackbar('Comment added', { variant: 'success' });
      setNewComments(prev => ({ ...prev, [postId]: '' }));
      fetchComments(postId);
    } catch (error) {
      console.error('Error adding comment:', error);
      enqueueSnackbar('Failed to add comment', { variant: 'error' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getAuthorName = (authorDetails) => {
    if (!authorDetails) return 'Unknown Farmer';
    if (authorDetails.first_name && authorDetails.last_name) {
      return `${authorDetails.first_name} ${authorDetails.last_name}`;
    }
    return authorDetails.username;
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight={700} color="primary">Farmer's Forum</Typography>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewPostForm(!showNewPostForm)}
          >
            New Post
          </Button>
        )}
      </Box>

      {/* New Post Form */}
      <Collapse in={showNewPostForm}>
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Create a New Post</Typography>
          <form onSubmit={handleSubmitPost}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={newPost.title}
              onChange={handleNewPostChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Content"
              name="content"
              value={newPost.content}
              onChange={handleNewPostChange}
              margin="normal"
              required
            />

            <Box display="flex" alignItems="center" my={2}>
              <Button variant="outlined" component="label" startIcon={<ImageIcon />}>
                Upload Image
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
              {image && <Typography variant="caption" ml={2}>{image.name}</Typography>}
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button onClick={() => setShowNewPostForm(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={!newPost.title || !newPost.content}>
                Post
              </Button>
            </Box>
          </form>
        </Paper>
      </Collapse>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="textSecondary">No posts yet. Start the discussion!</Typography>
        </Box>
      ) : (
        posts.map((post) => (
          <Card key={post.id} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  {post.author_details?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box flexGrow={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {getAuthorName(post.author_details)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(post.created_at)}
                  </Typography>
                </Box>
                {/* Delete Button for Owner */}
                {user && user.id === post.author && (
                  <IconButton color="error" onClick={() => handleDeletePost(post.id)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Typography variant="h6" gutterBottom>{post.title}</Typography>
              <Typography variant="body1" paragraph>{post.content}</Typography>

              {post.image && (
                <Box mb={2} borderRadius={2} overflow="hidden" maxHeight="400px">
                  <img src={post.image} alt="Post attachment" style={{ width: '100%', objectFit: 'cover' }} />
                </Box>
              )}

              <Box display="flex" alignItems="center" gap={3} pt={1}>
                <Button
                  startIcon={post.is_liked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                  color={post.is_liked ? 'primary' : 'inherit'}
                  onClick={() => handleLike(post.id)}
                >
                  {post.likes_count || 0} Likes
                </Button>

                <Button
                  startIcon={<CommentIcon />}
                  color="inherit"
                  onClick={() => handleToggleComments(post.id)}
                >
                  Comments
                </Button>
              </Box>

              {/* Comments Section */}
              <Collapse in={expandedComments[post.id]}>
                <Box mt={3} pl={2} borderLeft="4px solid #f0f0f0">
                  {/* Comment Form */}
                  {isAuthenticated && (
                    <Box display="flex" gap={1} mb={3}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                        {user?.username?.charAt(0)}
                      </Avatar>
                      <Box flexGrow={1}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Write a reply..."
                          value={newComments[post.id] || ''}
                          onChange={(e) => setNewComments({ ...newComments, [post.id]: e.target.value })}
                        />
                        <Box display="flex" justifyContent="flex-end" mt={1}>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={!newComments[post.id]}
                            onClick={() => handleAddComment(post.id)}
                          >
                            Reply
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Comments List */}
                  {comments[post.id]?.map((comment, idx) => (
                    <Box key={idx} mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {getAuthorName(comment.author_details)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(comment.created_at)}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{comment.content}</Typography>
                    </Box>
                  ))}
                </Box>
              </Collapse>

            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Forum;
