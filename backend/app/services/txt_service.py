async def extract_txt_text(file):
    content = await file.read()

    return content.decode("utf-8")