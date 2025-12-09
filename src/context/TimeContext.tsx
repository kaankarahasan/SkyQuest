import React, { createContext, ReactNode, useContext, useState } from 'react';

interface TimeContextType {
    currentDate: Date;
    simulatedOffset: number;
    simulateTimeTravel: (offsetMilliseconds: number) => void;
    resetTime: () => void;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export const TimeProvider = ({ children }: { children: ReactNode }) => {
    const [simulatedOffset, setSimulatedOffset] = useState<number>(0);

    // Derived state: Current simulated date
    const currentDate = new Date(Date.now() + simulatedOffset);

    // Function to set absolute offset
    const simulateTimeTravel = (offsetMilliseconds: number) => {
        setSimulatedOffset(offsetMilliseconds);
    };

    const resetTime = () => {
        setSimulatedOffset(0);
    };

    return (
        <TimeContext.Provider value={{ currentDate, simulatedOffset, simulateTimeTravel, resetTime }}>
            {children}
        </TimeContext.Provider>
    );
};

export const useTime = () => {
    const context = useContext(TimeContext);
    if (!context) {
        throw new Error('useTime must be used within a TimeProvider');
    }
    return context;
};
