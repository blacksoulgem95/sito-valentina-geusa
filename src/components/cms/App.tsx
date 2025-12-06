import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Navbar from './Navbar';
import Login from './Login';
import Dashboard from './Dashboard';
import PortfolioList from './PortfolioList';
import PortfolioForm from './PortfolioForm';
import BlogList from './BlogList';
import BlogForm from './BlogForm';
import BlogCategories from './BlogCategories';
import PagesList from './PagesList';
import PagesForm from './PagesForm';
import FilesManager from './FilesManager';
import SocialLinksManager from './SocialLinksManager';

export default function CMSApp() {
  return (
    <BrowserRouter basename="/vgadm">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Navbar />
              <Routes>
                <Route path="" element={<Dashboard />} />
                <Route path="portfolio" element={<PortfolioList />} />
                <Route path="portfolio/new" element={<PortfolioForm />} />
                <Route path="portfolio/:slug" element={<PortfolioForm />} />
                <Route path="blog" element={<BlogList />} />
                <Route path="blog/new" element={<BlogForm />} />
                <Route path="blog/:slug" element={<BlogForm />} />
                <Route path="blog/categories" element={<BlogCategories />} />
                <Route path="pages" element={<PagesList />} />
                <Route path="pages/new" element={<PagesForm />} />
                <Route path="pages/:slug" element={<PagesForm />} />
                <Route path="files" element={<FilesManager />} />
                <Route path="social-links" element={<SocialLinksManager />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
