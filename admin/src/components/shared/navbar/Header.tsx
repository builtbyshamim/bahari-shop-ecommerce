import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FiUserMinus } from 'react-icons/fi';
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { TbLockPassword } from 'react-icons/tb';
import { asideToggle } from '../../../redux/features/toggleSlice';
import { accessTokenKey, refreshTokenKey } from '../../../contents/token';
import { Bell, Search } from 'lucide-react';
import { useFetchMeQuery } from '../../../redux/api/authApi';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: meRes } = useFetchMeQuery(undefined);
  const user = meRes?.data;
  const initials = (user?.name || 'AD')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const [activeTab, setActiveTab] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🚀 Outside click close
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveTab(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      Cookies.remove(accessTokenKey, {
        path: '/',
      });
      Cookies.remove(refreshTokenKey, {
        path: '/',
      });
      navigate('/login');
      toast.success('Logged out successfully!');
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <nav className="bg-white border sticky z-400 top-0 w-full px-4 border-b border-[#E2E8F0] md:px-6 py-2.5 ">
        <div className="flex justify-between items-center gap-1">
          {/* Left Side */}
          <div className="flex items-center gap-2">
            <svg
              onClick={() => dispatch(asideToggle())}
              xmlns="http://www.w3.org/2000/svg"
              width={22}
              height={22}
              viewBox="0 0 22 22"
              fill="none"
              className={'cursor-pointer'}
            >
              {' '}
              <path
                d="M3.66667 16.5C3.40695 16.5 3.18939 16.412 3.014 16.236C2.83861 16.06 2.75061 15.8424 2.75 15.5833C2.74939 15.3242 2.83739 15.1067 3.014 14.9307C3.19061 14.7547 3.40817 14.6667 3.66667 14.6667H13.75C14.0097 14.6667 14.2276 14.7547 14.4036 14.9307C14.5796 15.1067 14.6673 15.3242 14.6667 15.5833C14.6661 15.8424 14.5781 16.0603 14.4027 16.2369C14.2273 16.4135 14.0097 16.5012 13.75 16.5H3.66667ZM17.325 14.9417L14.025 11.6417C13.8417 11.4583 13.75 11.2444 13.75 11C13.75 10.7556 13.8417 10.5417 14.025 10.3583L17.325 7.05833C17.4931 6.89028 17.7069 6.80625 17.9667 6.80625C18.2264 6.80625 18.4403 6.89028 18.6083 7.05833C18.7764 7.22639 18.8604 7.44028 18.8604 7.7C18.8604 7.95972 18.7764 8.17361 18.6083 8.34167L15.95 11L18.6083 13.6583C18.7764 13.8264 18.8604 14.0403 18.8604 14.3C18.8604 14.5597 18.7764 14.7736 18.6083 14.9417C18.4403 15.1097 18.2264 15.1938 17.9667 15.1938C17.7069 15.1938 17.4931 15.1097 17.325 14.9417ZM3.66667 11.9167C3.40695 11.9167 3.18939 11.8287 3.014 11.6527C2.83861 11.4767 2.75061 11.2591 2.75 11C2.74939 10.7409 2.83739 10.5233 3.014 10.3473C3.19061 10.1713 3.40817 10.0833 3.66667 10.0833H11C11.2597 10.0833 11.4776 10.1713 11.6536 10.3473C11.8296 10.5233 11.9173 10.7409 11.9167 11C11.9161 11.2591 11.8281 11.477 11.6527 11.6536C11.4773 11.8302 11.2597 11.9179 11 11.9167H3.66667ZM3.66667 7.33333C3.40695 7.33333 3.18939 7.24533 3.014 7.06933C2.83861 6.89333 2.75061 6.67578 2.75 6.41667C2.74939 6.15756 2.83739 5.94 3.014 5.764C3.19061 5.588 3.40817 5.5 3.66667 5.5H13.75C14.0097 5.5 14.2276 5.588 14.4036 5.764C14.5796 5.94 14.6673 6.15756 14.6667 6.41667C14.6661 6.67578 14.5781 6.89364 14.4027 7.07025C14.2273 7.24686 14.0097 7.33456 13.75 7.33333H3.66667Z"
                fill="#1D2535"
              />{' '}
            </svg>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search dashboard..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-[#DBDFE9] rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#ff6d29] focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Profile */}
          <div className="flex items-center cursor-pointer gap-2.5">
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              <div
                onClick={() => setActiveTab(!activeTab)}
                className="hidden md:flex items-center gap-3 cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#ff6d29] to-[#ffb347] flex items-center justify-center text-white font-semibold text-sm">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || user?.phone || 'admin'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div
          ref={dropdownRef}
          className={`
                        absolute right-0 top-14 min-w-[250px] z-[500] bg-white shadow-2xs rounded border-t border-gray-100
                        transition-all duration-300 origin-top-right
                        ${
                          activeTab
                            ? 'opacity-100 scale-100 visible'
                            : 'opacity-0 scale-95 invisible'
                        }
                    `}
        >
          {/* User info in dropdown */}
          <div className="px-6 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || user?.phone || '—'}</p>
          </div>

          <Link
            to="/admin/profile"
            onClick={() => setActiveTab(false)}
            className="px-6 py-2 flex hover:bg-orange-50 hover:text-[#ff6d29] justify-between items-center cursor-pointer transition-colors duration-200"
          >
            <div className="flex items-center text-sm gap-2">
              <FiUserMinus />
              <h1>Profile</h1>
            </div>
          </Link>

          <Link
            to="/admin/change-password"
            onClick={() => setActiveTab(false)}
            className="px-6 py-2 flex hover:bg-orange-50 hover:text-[#ff6d29] justify-between items-center cursor-pointer transition-colors duration-200"
          >
            <div className="flex items-center text-sm gap-2">
              <TbLockPassword />
              <h1>Change Password</h1>
            </div>
          </Link>

          <div
            onClick={handleLogout}
            className="px-6 py-2 flex hover:bg-red-500 text-red-500 hover:text-white justify-between items-center cursor-pointer transition-colors duration-200"
          >
            <div className="flex items-center text-sm gap-2">
              <RiLogoutCircleRLine />
              <h1>Logout</h1>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
