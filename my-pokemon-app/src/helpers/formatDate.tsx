const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    return formattedDate;
};

export default formatDate;