import {View, Text} from 'react-native';
import React from 'react';

/**
 * List heading component that displays a styled title for list sections.
 * @param {ListHeadingProps} props - The component props.
 * @param {string} props.title - The title text to display.
 * @returns {JSX.Element} The list heading UI.
 */
const ListHeading = ({ title }:ListHeadingProps) => {
    return (
        <View className="list-head">
            <Text className="list-title">{title}</Text>

        </View>
    );
};

export default ListHeading;
