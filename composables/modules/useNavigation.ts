/**
 * 导航相关组合式函数
 * @returns {Object} 导航相关方法
 */
export function useNavigation() {
  const handleBack = () => {
    uni.navigateBack()
  }

  return {
    handleBack
  }
}
