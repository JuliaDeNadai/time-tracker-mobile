import { createContext, useContext, useState } from "react";
import { SafeAreaView } from "react-native";
import { account } from "../lib/appwrite-config";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState(false);
    const [user, setUser] = useState(false);
    const repository = new AuthRepository()

    const signin = async ({email, password}) => {
        setLoading(true)
        try{
            const responseSession = await account.createEmailPasswordSession(
                email,
                password
            );
            setSession(responseSession);
            const responseUser = await account.get();
            setUser(responseUser);
        }
        catch(error){
            console.log(error)
        }
        setLoading(false);
    };
    
    const signout = async () => {
        setLoading(true);
        await account.deleteSession("current");
        setSession(null);
        setLoading(false);
    };

    const contextData = { session, user, signin, signout };
    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                <SafeAreaView>
                    <TextCustom fontSize={48}>Loading..</TextCustom>
                </SafeAreaView>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    return useContext(AuthContext);
};

export { AuthContext, AuthProvider, useAuth };

