import React from 'react';

const Loader = () => {
    return (
        <div className="flex items-center justify-center p-8">
            <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <div className="absolute inset-0 rounded-full h-12 w-12 border-t-2 border-blue-200 animate-pulse"></div>
            </div>
        </div>
    );
};

export default Loader;