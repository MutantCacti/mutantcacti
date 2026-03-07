import { BrowserRouter, Routes, Route } from "react-router-dom"
import LSystemCanvas from "./components/LSystemCanvas"
import Layout from "./Layout"
import Profile from "./pages/Profile"
import Projects from "./pages/Projects"
import Blog from "./pages/Blog"
import BlogPost from "./pages/BlogPost"
import NotFound from "./pages/NotFound"

function App() {
    return (
        <div className="relative min-h-screen bg-bg text-text">
            <LSystemCanvas />
            <div className="relative min-h-screen">
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path='/' element={<Profile />} />
                            <Route path='/projects' element={<Projects />} />
                            <Route path='/blog' element={<Blog />} />
                            <Route path='/blog/:category' element={<Blog />} />
                            <Route path='/blog/:category/:slug' element={<BlogPost />} />
                            <Route path='*' element={<NotFound />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </div>
        </div>
    )
}

export default App
