import { ActiveView } from '../../types';

interface TopBarProps {
    username: string;
    onLogout: () => void;
    activeView: ActiveView;
    onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ username, onLogout, activeView, onToggleSidebar }) => {
    const viewLabels: Record<ActiveView, string> = {
        dashboard: 'Dashboard',
        prospects: 'Prospects',
        clients: 'Clients',
        classes: 'Classes',
        conversions: 'Completed Jobs',
        finance: 'Finance',
        settings: 'Settings',
        communications: 'Tasks',
    };

    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
                {/* Mobile Toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
                    aria-label="Toggle Sidebar"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>

                {/* Breadcrumbs */}
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-slate-400">/</span>
                    <span className="font-semibold text-brand-dark">{viewLabels[activeView]}</span>
                </div>
            </div>

            {/* Right Side: Search + User */}
            <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-64 pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">{username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="text-sm">
                            <div className="font-semibold text-brand-dark">{username}</div>
                            <div className="text-xs text-slate-500">Admin</div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={onLogout}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
