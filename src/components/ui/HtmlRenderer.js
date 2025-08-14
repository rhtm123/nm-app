import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';

const HtmlRenderer = ({ htmlContent, maxLines = 3, style = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);

  // Simple HTML to text conversion for React Native
  const stripHtml = (html) => {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };

  const plainText = stripHtml(htmlContent);

  // Check if content needs truncation
  const needsTruncation = plainText && (plainText.length > 200 || plainText.split('\n').length > maxLines);

  const handleTextLayout = (event) => {
    const { lines } = event.nativeEvent;
    if (lines && lines.length > maxLines) {
      setShouldShowButton(true);
    }
  };

  if (!plainText) {
    return null;
  }

  return (
    <View style={style}>
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: 14,
          lineHeight: 20,
        }}
        numberOfLines={isExpanded ? undefined : maxLines}
        onTextLayout={handleTextLayout}
      >
        {plainText}
      </Text>
      
      {/* Show Read More button if content is long or if text layout detected truncation */}
      {(needsTruncation || shouldShowButton) && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={{ 
            marginTop: 8,
            alignSelf: 'flex-start',
            paddingVertical: 4,
            paddingHorizontal: 8,
            backgroundColor: colors.primary + '10',
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 13,
              fontWeight: '600',
            }}
          >
            {isExpanded ? 'Read Less ↑' : 'Read More ↓'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HtmlRenderer;
