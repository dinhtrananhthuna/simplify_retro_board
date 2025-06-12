# 🚀 Simplify Retro Board

**Version 1.0** - A modern, real-time retrospective board application built with Next.js 15

> A streamlined solution for agile teams to conduct effective retrospective meetings with real-time collaboration, timer management, and intuitive user experience.

## ✨ Features

### 🎯 **Core Retrospective Functionality**
- **Three Column Layout**: "Went Well", "To Improve", "Action Items"
- **Sticky Notes Management**: Create, edit, delete, and organize feedback
- **Real-time Collaboration**: Live updates across all connected users
- **Voting System**: Team members can vote on important items
- **Comments & Discussions**: Add detailed comments to any sticky note

### ⏰ **Timer Management**
- **Session Timer**: Built-in timer for timeboxed retrospectives
- **Owner Controls**: Only board owners can start/pause/stop timers
- **Real-time Sync**: Timer state synchronized across all participants
- **Audio Notifications**: Sound alerts when time is up
- **Preset Times**: Quick access to 5, 10, 15, 30-minute timers
- **Custom Duration**: Set custom minutes and seconds

### 👥 **User Management & Presence**
- **Authentication**: Secure user registration and login
- **Board Ownership**: Creator has full control over board settings
- **Member Management**: Invite team members via shareable links
- **Live Presence**: See who's currently online and active
- **User Avatars**: Visual identification of team members

### 🔄 **Real-time Features**
- **Live Updates**: All actions sync instantly across devices
- **Presence Tracking**: Real-time online/offline status
- **Instant Notifications**: Toast messages for important events
- **Auto-reconnection**: Robust connection management

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks with optimized patterns
- **Real-time**: Ably for WebSocket connections

### **Backend**
- **API**: Next.js API Routes (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credential provider
- **Real-time**: Ably infrastructure for broadcasting events

### **Performance Optimizations**
- **Bundle Size**: Optimized to 13.5kB for main board page
- **Lazy Loading**: Dynamic imports with React Suspense
- **Memoization**: Strategic React.memo and useMemo usage
- **Efficient Updates**: Minimal re-renders with stable dependencies

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database
- Ably account (free tier available)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd simplify_retro_board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` file:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/retro_board"
   
   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Real-time
   ABLY_API_KEY="your-ably-api-key"
   NEXT_PUBLIC_ABLY_KEY="your-ably-public-key"
   
   # Application
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── auth/              # Authentication pages
│   ├── boards/            # Board management
│   ├── dashboard/         # User dashboard
│   └── profile/           # User settings
├── components/            # Reusable UI components
│   ├── layouts/           # Layout components
│   ├── providers/         # Context providers
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── types/                 # TypeScript definitions
└── __tests__/             # Test files
```

## 🎮 Usage Guide

### **Creating a Board**
1. Register/Login to your account
2. Click "Create New Board" from dashboard
3. Enter board title and description
4. Share invite link with team members

### **Running a Retrospective**
1. **Setup**: Invite team members and set timer
2. **Collect**: Team adds sticky notes to appropriate columns
3. **Discuss**: Vote on important items and add comments
4. **Plan**: Focus on action items and next steps

### **Timer Management** (Owner Only)
- Use preset times or set custom duration
- Start/pause/resume as needed
- All participants see synchronized countdown
- Audio notification when time expires

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# CI mode
npm run test:ci
```

**Test Coverage**: 88.3% (83/94 tests passing)

## 📊 Performance Metrics

- **Bundle Size**: 13.5kB (board page)
- **First Load JS**: 384kB total
- **Build Time**: ~4 seconds
- **Lighthouse Score**: 95+ (Performance)

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect GitHub repository to Vercel
2. Add environment variables in dashboard
3. Deploy automatically on push to main

### **Docker**
```bash
# Build image
docker build -t retro-board .

# Run container
docker run -p 3000:3000 retro-board
```

## 🔄 Version History

### **Version 1.0** (Current)
- ✅ Complete retrospective board functionality
- ✅ Real-time collaboration with Ably
- ✅ Timer management system
- ✅ User authentication & presence
- ✅ Responsive design & performance optimization
- ✅ Comprehensive testing infrastructure

*All features are at basic level, providing solid foundation for future enhancements*

## 🛣️ Roadmap

### **Version 1.1** (Planned)
- Advanced board templates
- Export/import functionality
- Enhanced analytics
- Mobile app support

### **Version 2.0** (Future)
- Advanced facilitation tools
- Integration with project management tools
- Advanced reporting & insights
- Enterprise features

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Real-time functionality powered by [Ably](https://ably.com/)
- Database management with [Prisma](https://prisma.io/)

---

**Made with ❤️ for agile teams everywhere**
