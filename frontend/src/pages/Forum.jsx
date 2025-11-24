import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  TextField,
  Grid,
  Avatar,
  Divider,
  IconButton,
  CircularProgress,
  Paper
} from '@mui/material';
import { 
  Add as AddIcon, 
  ThumbUp as ThumbUpIcon, 
  Comment as CommentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Forum = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});

  // Fetch forum posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await api.get('/api/forum/posts/');
        // setPosts(response.data);
        
        // Mock data for now
        const mockPosts = [
          {
            id: 1,
            title: 'Best practices for organic farming',
            content: 'I would like to share some tips for organic farming...',
            author: { username: 'farmer_john', user_type: 'FARMER' },
            created_at: '2023-11-20T10:30:00Z',
            likes: 5,
            comments_count: 3
          },
          {
            id: 2,
            title: 'Looking for advice on crop rotation',
            content: 'I\'m planning my crop rotation for next season...',
            author: { username: 'new_farmer', user_type: 'FARMER' },
            created_at: '2023-11-18T14:45:00Z',
            likes: 2,
            comments_count: 1
          }
        ];
        setPosts(mockPosts);
      } catch (error) {
        console.error('Error fetching forum posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleNewPostChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    try {
      // TODO: Replace with actual API call
      // const response = await api.post('/api/forum/posts/', newPost);
      // setPosts([response.data, ...posts]);
      
      // Mock response
      const mockPost = {
        id: Date.now(),
        title: newPost.title,
        content: newPost.content,
        author: { 
          username: user?.username || 'Current User', 
          user_type: user?.user_type || 'FARMER' 
        },
        created_at: new Date().toISOString(),
        likes: 0,
        comments_count: 0
      };
      
      setPosts([mockPost, ...posts]);
      setNewPost({ title: '', content: '' });
      setShowNewPostForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      // TODO: Replace with actual API call
      // await api.post(`/api/forum/posts/${postId}/like/`);
      
      // Update local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: (post.likes || 0) + 1 } 
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = (postId) => {
    const comment = newComments[postId]?.trim();
    if (!comment) return;

    // TODO: Replace with actual API call
    // await api.post(`/api/forum/posts/${postId}/comments/`, { content: comment });
    
    // Update local state
    const updatedComments = {
      ...comments,
      [postId]: [
        ...(comments[postId] || []),
        {
          id: Date.now(),
          content: comment,
          author: { 
            username: user?.username || 'Current User',
            user_type: user?.user_type || 'FARMER'
          },
          created_at: new Date().toISOString()
        }
      ]
    };
    
    setComments(updatedComments);
    setNewComments(prev => ({ ...prev, [postId]: '' }));
    
    // Update comment count
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments_count: (post.comments_count || 0) + 1 } 
        : post
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">Farmer's Forum</Typography>
        {isAuthenticated && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => setShowNewPostForm(!showNewPostForm)}
          >
            New Post
          </Button>
        )}
      </Box>

      {/* New Post Form */}
      {showNewPostForm && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
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
            <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
              <Button 
                variant="outlined" 
                onClick={() => setShowNewPostForm(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={!newPost.title.trim() || !newPost.content.trim()}
              >
                Post
              </Button>
            </Box>
          </form>
        </Paper>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="textSecondary">
            No posts yet. Be the first to start a discussion!
          </Typography>
          {!isAuthenticated && (
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/login', { state: { from: '/forum' } })}
            >
              Log in to post
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          {posts.map((post) => (
            <Card key={post.id} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                    {post.author?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {post.author?.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(post.created_at)}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="h6" component="h2" gutterBottom>
                  {post.title}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {post.content}
                </Typography>
                
                <Box display="flex" alignItems="center" mt={2}>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleLike(post.id)}
                  >
                    <ThumbUpIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary" mr={2}>
                    {post.likes || 0}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" ml={2}>
                    <CommentIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {post.comments_count || 0} comments
                    </Typography>
                  </Box>
                  
                  {user?.username === post.author?.username && (
                    <Box ml="auto">
                      <IconButton size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                
                {/* Comments Section */}
                <Box mt={2}>
                  {isAuthenticated && (
                    <Box display="flex" mb={2}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '0.875rem',
                          mr: 1 
                        }}
                      >
                        {user?.username?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box flexGrow={1}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Write a comment..."
                          value={newComments[post.id] || ''}
                          onChange={(e) => 
                            setNewComments(prev => ({
                              ...prev,
                              [post.id]: e.target.value
                            }))
                          }
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                        />
                        <Button 
                          size="small" 
                          color="primary"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComments[post.id]?.trim()}
                          sx={{ mt: 0.5 }}
                        >
                          Post Comment
                        </Button>
                      </Box>
                    </Box>
                  )}
                  
                  {/* Display Comments */}
                  {(comments[post.id] || []).map((comment) => (
                    <Box key={comment.id} display="flex" mb={2}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '0.75rem',
                          bgcolor: 'primary.light',
                          mr: 1 
                        }}
                      >
                        {comment.author?.username?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Box bgcolor="action.hover" p={1.5} borderRadius={1}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {comment.author?.username}
                          </Typography>
                          <Typography variant="body2">
                            {comment.content}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" ml={1}>
                          {formatDate(comment.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Forum;
