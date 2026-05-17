import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import ArticleList from './pages/ArticleList'
import CreateArticle from './pages/CreateArticle'
import ArticleDetail from './pages/ArticleDetail'
import CategoryList from './pages/CategoryList'
import ApprovalQueue from './pages/ApprovalQueue'

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/articles" element={<ArticleList />} />
            <Route path="/articles/create" element={<CreateArticle />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/approval" element={<ApprovalQueue />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
