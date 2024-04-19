export const getUserData = () => {
  const userInfoElement = document.getElementById("user-info");
  if (userInfoElement) {
    try {
      const userData = JSON.parse(
        userInfoElement.getAttribute("data-user-info")!
      );
      userInfoElement.removeAttribute("data-user-info");
      return userData;
    } catch (e) {
      console.error(e);
    }
  }
};
