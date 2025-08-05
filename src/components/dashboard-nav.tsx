'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Chat', href: '/chat', icon: ChatBubbleBottomCenterTextIcon },
  { name: 'Automation', href: '/automation', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Aura</h1>
      </div>
      <div className="flex flex-col flex-1 p-4 overflow-y-auto">
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                pathname === item.href
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
              )}
            >
              <item.icon
                className={classNames(
                  pathname === item.href
                    ? 'text-blue-500'
                    : 'text-gray-400 group-hover:text-gray-500',
                  'mr-3 flex-shrink-0 h-6 w-6'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
} 