// Kiểm tra xem API key đã được cung cấp trong biến môi trường chưa.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY chưa được thiết lập trong biến môi trường.");
}

/**
 * Hàm tiện ích chuyển đổi một đối tượng File sang chuỗi Base64.
 * Base64 là định dạng cần thiết để gửi dữ liệu hình ảnh qua API dưới dạng inline data.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Gửi một hình ảnh đến Gemini API để tạo ra hai prompt mô tả bằng TIẾNG ANH.
 */
export const generatePromptFromImage = async (imageFile: File): Promise<{ malePrompt: string; femalePrompt: string }> => {
  if (!API_KEY) {
    throw new Error("API Key chưa được cấu hình. Vui lòng thêm VITE_GEMINI_API_KEY vào file .env");
  }

  try {
    const base64Image = await fileToBase64(imageFile);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
            text: `From the provided image, generate two distinct artistic prompts in English.

1. **For the Male Prompt:** Create a concise, artistic prompt in English for a male subject based on the image. Focus on style, setting, and action.
2. **For the Female Prompt:** Create a concise, artistic prompt in English for a female subject based on the image. Adjust clothing appropriately. Focus on style, setting, and action.

Return the result as a single, valid JSON object with the keys 'malePrompt' and 'femalePrompt'.`
            },
            {
              inline_data: {
                mime_type: imageFile.type,
                data: base64Image
              }
            }
          ]
        }],
        generation_config: {
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      const parsedResult = JSON.parse(text);
      return {
        malePrompt: parsedResult.malePrompt || 'Không thể tạo prompt nam',
        femalePrompt: parsedResult.femalePrompt || 'Không thể tạo prompt nữ'
      };
    }
    
    throw new Error("API không trả về kết quả hợp lệ");
  } catch (error) {
    console.error("Lỗi khi giao tiếp với Gemini API:", error);
    throw new Error("Không thể tạo prompt từ hình ảnh. Vui lòng kiểm tra API key và thử lại.");
  }
};

/**
 * Gửi một hình ảnh và một prompt đến Gemini API để chỉnh sửa hình ảnh đó.
 */
export const editImageWithPrompt = async (imageFile: File, prompt: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key chưa được cấu hình. Vui lòng thêm VITE_GEMINI_API_KEY vào file .env");
  }

  try {
    // Tạm thời trả về ảnh gốc với thông báo
    throw new Error("Tính năng chỉnh sửa ảnh hiện tại chưa khả dụng với API key hiện tại. Vui lòng sử dụng API key có quyền truy cập Image Generation.");
  } catch (error) {
    console.error("Lỗi khi chỉnh sửa ảnh:", error);
    throw error;
  }
};