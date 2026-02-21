// Project data configuration
// Edit this file to add, remove, or modify your projects

export const projects = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'A modern e-commerce platform built with React and Node.js, featuring real-time inventory management and secure payment processing.',
    fullDescription: `A full-stack e-commerce platform designed with scalability and user experience in mind.

Features:
• Real-time inventory tracking
• Secure payment processing with Stripe
• Advanced search and filtering
• User authentication and authorization
• Admin dashboard for product management
• Responsive design for all devices

Built with React, Node.js, Express, MongoDB, and deployed on AWS.`,
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop&q=80',
    tags: ['React', 'Node.js', 'MongoDB', 'AWS'],
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com',
    gallery: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80',
    ],
    code: `// Example code snippet
const processPayment = async (order) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.total * 100,
      currency: 'usd',
      metadata: { orderId: order.id }
    });
    return paymentIntent;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
};`
  },
  {
    id: 2,
    title: 'AI-Powered Chat Bot',
    description: 'An intelligent chatbot using natural language processing to provide customer support and answer queries.',
    fullDescription: `An AI chatbot leveraging GPT-4 for natural, context-aware conversations.

Key Features:
• Natural language understanding
• Context-aware responses
• Multi-language support
• Integration with customer databases
• Analytics dashboard
• 24/7 automated support

Technologies: Python, FastAPI, OpenAI API, React, WebSocket`,
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&h=400&fit=crop&q=80',
    tags: ['Python', 'OpenAI', 'React', 'FastAPI'],
    githubUrl: 'https://github.com',
    gallery: [
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&q=80',
    ],
    code: `# Example chatbot endpoint
@app.post("/chat")
async def chat(message: str):
    response = await openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": message}
        ]
    )
    return {"reply": response.choices[0].message.content}`
  },
  {
    id: 3,
    title: 'Real-Time Analytics Dashboard',
    description: 'A comprehensive analytics dashboard with real-time data visualization and interactive charts.',
    fullDescription: `A powerful analytics platform for real-time business intelligence.

Capabilities:
• Live data streaming
• Interactive charts and graphs
• Custom report generation
• Data export functionality
• User role management
• API integration

Stack: React, D3.js, TypeScript, WebSocket, PostgreSQL`,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80',
    tags: ['React', 'D3.js', 'TypeScript', 'PostgreSQL'],
    liveUrl: 'https://example.com',
    code: `// Real-time data update with WebSocket
const ws = new WebSocket('ws://api.example.com/stream');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateChart(data);
  updateMetrics(data);
};`
  },
  {
    id: 4,
    title: 'Mobile Fitness Tracker',
    description: 'Cross-platform mobile app for tracking workouts, nutrition, and health metrics.',
    fullDescription: `A comprehensive fitness tracking application for iOS and Android.

Features:
• Workout logging and tracking
• Nutrition and calorie counter
• Progress visualization
• Social sharing
• Personal training plans
• Integration with wearables

Built with React Native, Firebase, and HealthKit/Google Fit APIs.`,
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop&q=80',
    tags: ['React Native', 'Firebase', 'Mobile'],
    gallery: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&q=80',
    ],
  },
  {
    id: 5,
    title: 'Blockchain Voting System',
    description: 'A secure and transparent voting system built on blockchain technology.',
    fullDescription: `A decentralized voting platform ensuring transparency and security.

Highlights:
• Immutable vote records
• Anonymous voting
• Real-time result tracking
• Smart contract verification
• Audit trails
• Scalable architecture

Technologies: Solidity, Ethereum, Web3.js, React`,
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop&q=80',
    tags: ['Blockchain', 'Solidity', 'Web3', 'Ethereum'],
    githubUrl: 'https://github.com',
    code: `// Smart contract example
pragma solidity ^0.8.0;

contract Voting {
    mapping(address => bool) public hasVoted;
    mapping(uint => uint) public voteCounts;
    
    function vote(uint candidateId) public {
        require(!hasVoted[msg.sender], "Already voted");
        voteCounts[candidateId]++;
        hasVoted[msg.sender] = true;
    }
}`
  },
  {
    id: 6,
    title: 'Social Media Scheduler',
    description: 'Multi-platform social media management tool with scheduling, analytics, and content planning.',
    fullDescription: `Streamline your social media presence across all platforms.

Features:
• Multi-platform posting
• Content scheduling
• Analytics and insights
• Content calendar
• Team collaboration
• AI-powered suggestions

Built with Next.js, Prisma, PostgreSQL, and various social media APIs.`,
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop&q=80',
    tags: ['Next.js', 'Prisma', 'PostgreSQL', 'API Integration'],
    liveUrl: 'https://example.com',
  },
]

/*
Project Object Structure:
{
  id: number (required, unique)
  title: string (required)
  description: string (required, short description for card)
  fullDescription: string (optional, detailed description for modal)
  image: string (optional, URL for main project image)
  tags: string[] (optional, array of technology tags)
  liveUrl: string (optional, URL to live demo)
  githubUrl: string (optional, URL to GitHub repository)
  gallery: string[] (optional, array of image URLs for gallery)
  code: string (optional, code snippet to display)
}
*/

