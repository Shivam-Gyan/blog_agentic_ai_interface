// Parameter type for message submission — defined here to avoid a circular
// dependency between the interface layer and the page layer.
export type handleSubmitParameter = {
  input: string;
};

//  this interface has only (id, title and date) of converstaion of chat to display in sidebar
export interface ChatSidebarTemplate{
    thread_id: string;
    title:string;
    createdAt: string;
    is_active?: boolean;
}


// this interface is for section of sidebar (today, yesterday, last 30 days and older)
export interface ChatSidebarSectionProps{
    title: string;
    chats: ChatSidebarTemplate[];
    pathname: string;
}

export interface SidebarContentProps {
    pathname: string;
    setSidebarOpen: (sidebarOpen: boolean) => void;
    sidebarOpen: boolean;
    isChatLoading?: boolean;
    todayChats: ChatSidebarTemplate[];
    yesterdayChats: ChatSidebarTemplate[];
    last30DaysChats: ChatSidebarTemplate[];
    olderChats: ChatSidebarTemplate[];
}

export interface ShortSidebarStyleProps {
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    sidebarOpen: boolean;
    isChatLoading: boolean;
}

export interface ChatInterfaceProps {
    onSubmit:({ input }: handleSubmitParameter) => void;
    isLoading: boolean;
}