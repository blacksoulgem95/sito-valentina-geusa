import { Link } from 'react-router-dom';
import {
  FolderIcon,
  DocumentTextIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const stats = [
    {
      name: 'Portfolio',
      href: '/vgadm/portfolio',
      icon: FolderIcon,
      color: 'bg-pink-500',
    },
    {
      name: 'Blog',
      href: '/vgadm/blog',
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Pagine',
      href: '/vgadm/pages',
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'File',
      href: '/vgadm/files',
      icon: PhotoIcon,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="relative bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.name}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    Gestisci
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
