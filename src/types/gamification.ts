export interface Badge {
    id: string;
    title: string;
    description: string;
    icon: any; // ImageSourcePropType
    unlockCondition: (user: any, habitData: any) => boolean;
}
