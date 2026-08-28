import "@/global.css";
import {isClerkAPIResponseError, useSignIn} from "@clerk/expo";
import {Link, router} from "expo-router";
import React, {useMemo, useState} from "react";
import {ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View} from "react-native";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
import {clsx} from "clsx";
import {colors} from "@/constants/theme";

const SafeAreaView = styled(RNSafeAreaView);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Extracts a user-friendly error message from authentication errors.
 * @param {unknown} error - The error object to extract a message from.
 * @returns {string} A formatted error message for display.
 */
const getAuthErrorMessage = (error: unknown) => {
    if (isClerkAPIResponseError(error)) {
        return error.errors[0]?.longMessage || error.errors[0]?.message || "We could not complete that request.";
    }

    return "Something went wrong. Please try again.";
};

/**
 * Sign-in screen component that handles user authentication with email and password.
 * Validates input, manages form state, and redirects to tabs upon successful sign-in.
 * @returns {JSX.Element} The sign-in screen UI.
 */
const SignIn = () => {
    const {fetchStatus, signIn} = useSignIn();
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ emailAddress?: string; password?: string }>({});
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = useMemo(
        () => emailAddress.trim().length > 0 && password.length > 0 && !isSubmitting && fetchStatus !== "fetching",
        [emailAddress, fetchStatus, isSubmitting, password]
    );

    /**
     * Validates email and password fields.
     * @returns {boolean} True if all fields are valid, false otherwise.
     */
    const validate = () => {
        const nextErrors: typeof fieldErrors = {};
        const email = emailAddress.trim();

        if (!email) {
            nextErrors.emailAddress = "Enter your email address.";
        } else if (!emailPattern.test(email)) {
            nextErrors.emailAddress = "Enter a valid email address.";
        }

        if (!password) {
            nextErrors.password = "Enter your password.";
        }

        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    /**
     * Handles the sign-in form submission, validates input, and authenticates the user.
     * @returns {Promise<void>}
     */
    const handleSignIn = async () => {
        if (!validate() || isSubmitting || fetchStatus === "fetching") {
            return;
        }

        setIsSubmitting(true);
        setFormError("");

        try {
            const {error} = await signIn.password({
                emailAddress: emailAddress.trim(),
                password,
            });

            if (error) {
                setFormError(error.longMessage || error.message);
                return;
            }

            if (signIn.status === "complete") {
                const {error: finalizeError} = await signIn.finalize();
                if (finalizeError) {
                    setFormError(finalizeError.longMessage || finalizeError.message);
                    return;
                }

                router.replace("/(tabs)");
                return;
            }

            setFormError("A little more verification is needed before you can continue.");
        } catch (error) {
            setFormError(getAuthErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="auth-safe-area">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="auth-screen">
                <ScrollView className="auth-scroll" keyboardShouldPersistTaps="handled" contentContainerClassName="auth-content">
                    <View className="auth-brand-block">
                        <View className="auth-logo-wrap">
                            <View className="auth-logo-mark">
                                <Text className="auth-logo-mark-text">N</Text>
                            </View>
                            <View>
                                <Text className="auth-wordmark">NewApp</Text>
                                <Text className="auth-wordmark-sub">Subscriptions</Text>
                            </View>
                        </View>
                        <Text className="auth-title">Welcome back</Text>
                        <Text className="auth-subtitle">Sign in to keep every plan, renewal, and payment in one place.</Text>
                    </View>

                    <View className="auth-card">
                        <View className="auth-form">
                            {formError ? <Text className="auth-error">{formError}</Text> : null}

                            <View className="auth-field">
                                <Text className="auth-label">Email</Text>
                                <TextInput
                                    className={clsx("auth-input", fieldErrors.emailAddress && "auth-input-error")}
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    onChangeText={(value) => {
                                        setEmailAddress(value);
                                        setFieldErrors((current) => ({...current, emailAddress: undefined}));
                                    }}
                                    placeholder="you@example.com"
                                    placeholderTextColor={colors.mutedForeground}
                                    textContentType="emailAddress"
                                    value={emailAddress}
                                />
                                {fieldErrors.emailAddress ? <Text className="auth-error">{fieldErrors.emailAddress}</Text> : null}
                            </View>

                            <View className="auth-field">
                                <Text className="auth-label">Password</Text>
                                <TextInput
                                    className={clsx("auth-input", fieldErrors.password && "auth-input-error")}
                                    autoCapitalize="none"
                                    autoComplete="current-password"
                                    onChangeText={(value) => {
                                        setPassword(value);
                                        setFieldErrors((current) => ({...current, password: undefined}));
                                    }}
                                    placeholder="Your password"
                                    placeholderTextColor={colors.mutedForeground}
                                    secureTextEntry
                                    textContentType="password"
                                    value={password}
                                />
                                {fieldErrors.password ? <Text className="auth-error">{fieldErrors.password}</Text> : null}
                            </View>

                            <Pressable className={clsx("auth-button", !canSubmit && "auth-button-disabled")} disabled={!canSubmit} onPress={handleSignIn}>
                                {isSubmitting ? (
                                    <ActivityIndicator color={colors.primary}/>
                                ) : (
                                    <Text className="auth-button-text">Continue</Text>
                                )}
                            </Pressable>
                        </View>

                        <View className="auth-link-row">
                            <Text className="auth-link-copy">New here?</Text>
                            <Link href="/(auth)/sign-up" className="auth-link">Create an account</Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignIn;
