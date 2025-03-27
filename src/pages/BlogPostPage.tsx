import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPost, type NotionPost } from '@/lib/notion';
import { formatDate } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, Calendar, User2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<NotionPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const postData = await getPost(slug);
        if (!postData) {
          setError('Post not found');
        } else {
          setPost(postData);
        }
      } catch (err) {
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl text-red-400 mb-4">{error}</h1>
          <Link
            to="/blog"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const featuredImage = post.thumbnail;

  // Ensure content is a string before passing to ReactMarkdown
  const processedContent = post.content && typeof post.content === 'string' 
    ? post.content 
    : 'No content available';

  // Debug log to confirm the value of processedContent
  console.log('Processed content for ReactMarkdown:', processedContent);

  return (
    <div className="min-h-screen pt-32 pb-16">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>

          <h1
            className="text-3xl md:text-4xl font-semibold mb-6 text-white">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-white/60 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.date}>{formatDate(new Date(post.date), 'MMMM dd, yyyy')}</time>
            </div>
          </div>

          {featuredImage && (
            <div className="relative h-[400px] mb-8 rounded-2xl overflow-hidden">
              <img
                src={featuredImage}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              // Allow raw HTML (e.g., for <details><summary> tags)
              details: ({ children }) => <details>{children}</details>,
              summary: ({ children }) => <summary>{children}</summary>,
              // Custom styles for other elements
              p: ({ node, ...props }) => <p className="mb-4 text-white/80 leading-relaxed" {...props} />,
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-cyan-400 no-underline hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <pre className="bg-white/5 p-4 rounded-lg overflow-x-auto">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="text-cyan-400" {...props}>
                    {children}
                  </code>
                );
              },
            }}
            className="prose prose-invert prose-cyan max-w-none
                     prose-headings:text-white prose-headings:font-semibold
                     prose-p:text-white/80 prose-p:leading-relaxed
                     prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-white prose-strong:font-semibold
                     prose-blockquote:border-cyan-400 prose-blockquote:text-white/70
                     prose-code:text-cyan-400 prose-pre:bg-white/5
                     prose-ol:text-white/80 prose-ul:text-white/80
                     prose-li:marker:text-cyan-400"
          >
            {processedContent}
          </ReactMarkdown>
        </motion.div>
      </article>
    </div>
  );
};

export default BlogPostPage;
