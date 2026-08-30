import React, { useState, useCallback } from 'react';
import { User, MapPin, Key, Camera, X } from 'lucide-react';
import UserInfoCard from '../../../components/UserProfile/UserInfoCard.tsx';
import UserLocationPage from './UserLocationPage.tsx';
import UserPhotoPage from './UserPhotoPage.tsx';
import UserPasswordPage from './UserPasswordPage.tsx';
import ErrorBoundary from '../../../utils/functions/ErrorBoundary.jsx';
import useReduxApiData from '../../../hooks/useTanstackQuery.js';
import { useSelector } from 'react-redux';
import AccessTable from './AccessTable.tsx';
const TABLE_NAME = "users";
const TABLE_PATH = "user";
export default function UserInfoPage() {

  const { user } = useSelector(state => state.authReducer)
  //const { onClose } = props;
  
  const [activeTab, setActiveTab] = useState('Profile');
  const userData = user || {}

   const { loadUpdate, isLoading, isProcessing } = useReduxApiData({
          table: TABLE_NAME,
          uniqueKey: TABLE_PATH,
          queryType: 'gets',
          mainParam: {},
          narration: 'get all users'
      });


   const handleUpdatePassword = useCallback(async (data) => {
        return await loadUpdate({
            ...data,
            cat: 'updatePassword'
        });
    }, []);

    const handleForceReset = useCallback(async (data) => {
        return await loadUpdate({
            ...data,
            cat: 'forceResetPassword'
        });
    }, []);

    const handleUpdatePhoto = useCallback(async (formData) => {
        return await loadUpdate(formData);
    }, []);

    const handleRemovePhoto = useCallback(async (data) => {
        return await loadUpdate({
            ...data,
            cat: 'removePhoto'
        });
    }, []);

     const onSave = useCallback((formData) => {
        loadUpdate(formData);
    }, []);



  // Define tabs with their corresponding Lucide icons
  const tabs = [
    { name: 'Profile', icon: User },
    { name: 'Password Manager', icon: Key },
    { name: 'Profile Photo', icon: Camera },
  ];

  return (
    <div className="w-full relative">
      
      {/* Header Container: Tabs on the left, Close button on the right */}
      <div className="flex justify-between items-center border-b border-gray-200 mb-6">
        
        {/* Tab Navigation */}
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`
                  group flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150
                  ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon 
                  className={`mr-2 h-5 w-5 ${
                    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`} 
                  aria-hidden="true"
                />
                {tab.name}
              </button>
            );
          })}
        </nav>

        {/* Close Button */}
       
          <button
            onClick={()=>setActiveTab("Profile")}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-150 focus:outline-none"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        
      </div>

      {/* Tab Content Rendering */}
      <div className="mt-4">
        {activeTab === 'Profile' && (
          <ErrorBoundary>
            <React.Suspense fallback={<div>Loading Locations...</div>}>
            <>
              <UserInfoCard
                user={userData}
                onSave={onSave}
                onClose={()=>setActiveTab("Profile")}
                showEdit={true}
                loading={isProcessing}
              />
              <AccessTable user={userData} />
              </>
          </React.Suspense>
          </ErrorBoundary>
        )}
        
        
        
        {activeTab === 'Password Manager' && (
          <ErrorBoundary>
            <React.Suspense fallback={<div>Loading Password Manager...</div>}>
              <UserPasswordPage
                UserData={userData}
                onClose={()=>setActiveTab("Profile")}
                onSave={onSave}
                onUpdatePassword={handleUpdatePassword}
                onForceReset={handleForceReset}
                isLoading={isLoading}
              />
            </React.Suspense>
          </ErrorBoundary>
        )}
        
        {activeTab === 'Profile Photo' && (
          <ErrorBoundary>
            <React.Suspense fallback={<div>Loading Profile Photo...</div>}>
              <UserPhotoPage
                UserData={userData}
                onClose={()=>setActiveTab("Profile")}
                onSave={onSave}
                onUpdatePhoto={handleUpdatePhoto}
                onRemovePhoto={handleRemovePhoto}
                isLoading={isLoading}
              />
            </React.Suspense>
          </ErrorBoundary>
        )}
      </div>
      
    </div>
  );
}