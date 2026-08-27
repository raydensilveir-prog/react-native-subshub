import "@/global.css";
import {isClerkAPIResponseError, useSignUp} from "@clerk/expo";
import {Link, router} from "expo-router";
import React, {useMemo, useState} from "react";
import {ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View} from "react-native";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
import {clsx} from "clsx";
import {colors} from "@/constants/theme";

const SafeAreaView = styled(RNSafeAreaView);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minPasswordLength = 8;

const getAuthErrorMessage = (error: unknown) => {
    if (isClerkAPIResponseError(error)) {
        return error.errors[0]?.longMessage || error.errors[0]?.message || "We could not complete that request.";
    }

    return "Something went wrong. Please try again.";
};

const SignUp = () => {
    const {fetchStatus, signUp} = useSignUp();
    const [fullName, setFullName] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [code, setCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{
        fullName?: string;
        emailAddress?: string;
        password?: string;
        confirmPassword?: string;
        code?: string;
    }>({});
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = useMemo(() => {
        if (fetchStatus === "fetching" || isSubmitting) {
            return false;
        }

        if (isVerifying) {
            return code.trim().length >= 6;
        }

        return fullName.trim().length > 0 && emailAddress.trim().length > 0 && password.length > 0 && confirmPassword.length > 0;
    }, [code, confirmPassword, emailAddress, fetchStatus, fullName, isSubmitting, isVerifying, password]);

    const validateAccountDetails = () => {
        const nextErrors: typeof fieldErrors = {};
        const email = emailAddress.trim();

        if (!fullName.trim()) {
            nextErrors.fullName = "Enter your name.";
        }

        if (!email) {
            nextErrors.emailAddress = "Enter your email address.";
        } else if (!emailPattern.test(email)) {
            nextErrors.emailAddress = "Enter a valid email address.";
        }

        if (!password) {
            nextErrors.password = "Create a password.";
        } else if (password.length < minPasswordLength) {
            nextErrors.password = `Use at least ${minPasswordLength} characters.`;
        }

        if (!confirmPassword) {
            nextErrors.confirmPassword = "Confirm your password.";
        } else if (confirmPassword !== password) {
            nextErrors.confirmPassword = "Passwords do not match.";
        }

        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const validateCode = () => {
        const nextErrors: typeof fieldErrors = {};

        if (!code.trim()) {
            nextErrors.code = "Enter the code from your email.";
        } else if (code.trim().length < 6) {
            nextErrors.code = "Enter the full verification code.";
        }

        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleCreateAccount = async () => {
        if (!validateAccountDetails() || isSubmitting || fetchStatus === "fetching") {
            return;
        }

        setIsSubmitting(true);
        setFormError("");

        try {
            const [firstName, ...restName] = fullName.trim().split(/\s+/);

            const {error} = await signUp.password({
                emailAddress: emailAddress.trim(),
                password,
                firstName,
                lastName: restName.join(" ") || undefined,
            });

            if (error) {
                setFormError(error.longMessage || error.message);
                return;
            }

            const {error: sendError} = await signUp.verifications.sendEmailCode();
            if (sendError) {
                setFormError(sendError.longMessage || sendError.message);
                return;
            }

            setIsVerifying(true);
        } catch (error) {
            setFormError(getAuthErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerify = async () => {
        if (!validateCode() || isSubmitting || fetchStatus === "fetching") {
            return;
        }

        setIsSubmitting(true);
        setFormError("");

        try {
            const {error} = await signUp.verifications.verifyEmailCode({code: code.trim()});

            if (error) {
                setFormError(error.longMessage || error.message);
                return;
            }

            if (signUp.status === "complete") {
                const {error: finalizeError} = await signUp.finalize();
                if (finalizeError) {
                    setFormError(finalizeError.longMessage || finalizeError.message);
                    return;
                }

                router.replace("/(tabs)");
                return;
            }

            setFormError("We need one more step before your account is ready.");
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
                        <Text className="auth-title">{isVerifying ? "Check your email" : "Create your account"}</Text>
                        <Text className="auth-subtitle">
                            {isVerifying
                                ? `Enter the code sent to ${emailAddress.trim()} to finish setup.`
                                : "Start tracking renewals before they surprise your balance."}
                        </Text>
                    </View>

                    <View className="auth-card">
                        <View className="auth-form">
                            {formError ? <Text className="auth-error">{formError}</Text> : null}

                            {isVerifying ? (
                                <>
                                    <View className="auth-field">
                                        <Text className="auth-label">Verification code</Text>
                                        <TextInput
                                            className={clsx("auth-input", fieldErrors.code && "auth-input-error")}
                                            keyboardType="number-pad"
                                            onChangeText={(value) => {
                                                setCode(value);
                                                setFieldErrors((current) => ({...current, code: undefined}));
                                            }}
                                            placeholder="123456"
                                            placeholderTextColor={colors.mutedForeground}
                                            textContentType="oneTimeCode"
                                            value={code}
                                        />
                                        {fieldErrors.code ? <Text className="auth-error">{fieldErrors.code}</Text> : null}
                                    </View>

                                    <Pressable className={clsx("auth-button", !canSubmit && "auth-button-disabled")} disabled={!canSubmit} onPress={handleVerify}>
                                        {isSubmitting ? (
                                            <ActivityIndicator color={colors.primary}/>
                                        ) : (
                                            <Text className="auth-button-text">Verify email</Text>
                                        )}
                                    </Pressable>

                                    <Pressable className="auth-secondary-button" disabled={isSubmitting} onPress={() => {
                                        setIsVerifying(false);
                                        setCode("");
                                        setFormError("");
                                        setFieldErrors({});
                                    }}>
                                        <Text className="auth-secondary-button-text">Edit account details</Text>
                                    </Pressable>
                                </>
                            ) : (
                                <>
                                    <View className="auth-field">
                                        <Text className="auth-label">Name</Text>
                                        <TextInput
                                            className={clsx("auth-input", fieldErrors.fullName && "auth-input-error")}
                                            autoCapitalize="words"
                                            autoComplete="name"
                                            onChangeText={(value) => {
                                                setFullName(value);
                                                setFieldErrors((current) => ({...current, fullName: undefined}));
                                            }}
                                            placeholder="Rayden Silveira"
                                            placeholderTextColor={colors.mutedForeground}
                                            textContentType="name"
                                            value={fullName}
                                        />
                                        {fieldErrors.fullName ? <Text className="auth-error">{fieldErrors.fullName}</Text> : null}
                                    </View>

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
                                            autoComplete="new-password"
                                            onChangeText={(value) => {
                                                setPassword(value);
                                                setFieldErrors((current) => ({...current, password: undefined}));
                                            }}
                                            placeholder="At least 8 characters"
                                            placeholderTextColor={colors.mutedForeground}
                                            secureTextEntry
                                            textContentType="newPassword"
                                            value={password}
                                        />
                                        {fieldErrors.password ? <Text className="auth-error">{fieldErrors.password}</Text> : null}
                                    </View>

                                    <View className="auth-field">
                                        <Text className="auth-label">Confirm password</Text>
                                        <TextInput
                                            className={clsx("auth-input", fieldErrors.confirmPassword && "auth-input-error")}
                                            autoCapitalize="none"
                                            autoComplete="new-password"
                                            onChangeText={(value) => {
                                                setConfirmPassword(value);
                                                setFieldErrors((current) => ({...current, confirmPassword: undefined}));
                                            }}
                                            placeholder="Repeat your password"
                                            placeholderTextColor={colors.mutedForeground}
                                            secureTextEntry
                                            textContentType="newPassword"
                                            value={confirmPassword}
                                        />
                                        {fieldErrors.confirmPassword ? <Text className="auth-error">{fieldErrors.confirmPassword}</Text> : null}
                                    </View>

                                    <Pressable className={clsx("auth-button", !canSubmit && "auth-button-disabled")} disabled={!canSubmit} onPress={handleCreateAccount}>
                                        {isSubmitting ? (
                                            <ActivityIndicator color={colors.primary}/>
                                        ) : (
                                            <Text className="auth-button-text">Create account</Text>
                                        )}
                                    </Pressable>

                                    <View nativeID="clerk-captcha"/>
                                </>
                            )}
                        </View>

                        {!isVerifying ? (
                            <View className="auth-link-row">
                                <Text className="auth-link-copy">Already tracking?</Text>
                                <Link href="/(auth)/sign-in" className="auth-link">Sign in</Link>
                            </View>
                        ) : null}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignUp;
