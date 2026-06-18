// widgets/Pagination.js
import { WidgetFactory } from "../widget-factory/index.js";
import { Row } from "./Row.js";
import { Button } from "./Button.js";
import { Text } from "./Text.js";
import { Icon } from "./Icon.js";
import { colors } from "../utils/themes.js";

export const Pagination = (props) => {
  const {
    totalItems = 0,
    pageSize = 10,
    currentPage = 1,
    onPageChange,
    showFirstLast = true,
    showPrevNext = true,
    maxButtons = 5,
    variant = "outlined",
    color = colors.primary,
    size = "medium",
    disabled = false,
    showTotal = true,
    label = "Page",
    ...rest
  } = props;

  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  let current = Math.min(Math.max(currentPage, 1), totalPages);

  const handlePageChange = (page) => {
    if (disabled) return;
    if (page === current) return;
    if (page < 1 || page > totalPages) return;
    current = page;
    if (onPageChange) onPageChange(current);
  };

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const sizes = {
    small: { buttonSize: 32, fontSize: 12, iconSize: 16, gap: 4 },
    medium: { buttonSize: 36, fontSize: 14, iconSize: 20, gap: 6 },
    large: { buttonSize: 42, fontSize: 16, iconSize: 24, gap: 8 },
  };
  const sz = sizes[size] || sizes.medium;

  const buttonStyle = {
    minWidth: `${sz.buttonSize}px`,
    height: `${sz.buttonSize}px`,
    padding: "0",
    fontSize: `${sz.fontSize}px`,
  };

  const createPageButton = (page, isActive = false) => {
    const buttonVariant = isActive ? "filled" : variant;
    const buttonColor = isActive ? color : colors.textSecondary;

    return Button({
      text: String(page),
      variant: buttonVariant,
      bgColor: isActive ? color : "transparent",
      color: buttonColor,
      size: size,
      style: buttonStyle,
      onPress: () => handlePageChange(page),
      disabled: disabled || isActive,
    });
  };

  const createIconButton = (iconName, onClick, isDisabled = false) => {
    return Button({
      child: Icon({
        name: iconName,
        size: sz.iconSize,
        color: colors.textSecondary,
      }),
      variant: variant,
      size: size,
      style: buttonStyle,
      onPress: onClick,
      disabled: disabled || isDisabled,
      disableNativeEffects: true,
    });
  };

  // Main container using Row (already a widget)
  const container = Row({
    alignItems: "center",
    gap: sz.gap,
    justifyContent: "center",
    flexWrap: "wrap",
    ...rest,
  });

  // First button
  if (showFirstLast && totalPages > 1) {
    container.appendChild(
      createIconButton("first_page", () => handlePageChange(1), current === 1),
    );
  }

  // Previous button
  if (showPrevNext) {
    container.appendChild(
      createIconButton(
        "chevron_left",
        () => handlePageChange(current - 1),
        current === 1,
      ),
    );
  }

  // Page numbers
  if (pageNumbers[0] > 1) {
    container.appendChild(createPageButton(1));
    if (pageNumbers[0] > 2) {
      container.appendChild(
        Text({ text: "...", size: sz.fontSize, color: colors.textSecondary }),
      );
    }
  }

  pageNumbers.forEach((page) => {
    container.appendChild(createPageButton(page, page === current));
  });

  if (pageNumbers[pageNumbers.length - 1] < totalPages) {
    if (pageNumbers[pageNumbers.length - 1] < totalPages - 1) {
      container.appendChild(
        Text({ text: "...", size: sz.fontSize, color: colors.textSecondary }),
      );
    }
    container.appendChild(createPageButton(totalPages));
  }

  // Next button
  if (showPrevNext) {
    container.appendChild(
      createIconButton(
        "chevron_right",
        () => handlePageChange(current + 1),
        current === totalPages,
      ),
    );
  }

  // Last button
  if (showFirstLast && totalPages > 1) {
    container.appendChild(
      createIconButton(
        "last_page",
        () => handlePageChange(totalPages),
        current === totalPages,
      ),
    );
  }

  // Total info
  if (showTotal && totalItems > 0) {
    const start = (current - 1) * pageSize + 1;
    const end = Math.min(current * pageSize, totalItems);
    const infoText = `${label} ${current} of ${totalPages} (${start}-${end} of ${totalItems})`;
    const info = Text({
      text: infoText,
      size: sz.fontSize - 2,
      color: colors.textSecondary,
      marginLeft: sz.gap * 2,
    });
    container.appendChild(info);
  }

  return container;
};

export default Pagination;
