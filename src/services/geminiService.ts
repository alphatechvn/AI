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

  // Danh sách các model để thử theo thứ tự ưu tiên
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro',
    'gemini-pro-vision'
  ];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const result = await tryGenerateWithModel(imageFile, model);
      return result;
    } catch (error: any) {
      lastError = error;
      // Nếu không phải lỗi 404, throw ngay lập tức
      if (!error.message.includes('404') && !error.message.includes('Model không tìm thấy')) {
        throw error;
      }
      // Nếu là lỗi 404, thử model tiếp theo
      console.warn(`Model ${model} không khả dụng, thử model tiếp theo...`);
    }
  }

  // Nếu tất cả model đều thất bại
  throw new Error(`Không thể truy cập bất kỳ model Gemini nào. Lỗi cuối cùng: ${lastError?.message || 'Unknown error'}`);
};

/**
 * Thử tạo prompt với một model cụ thể
 */
const tryGenerateWithModel = async (imageFile: File, model: string): Promise<{ malePrompt: string; femalePrompt: string }> => {
  try {
    const base64Image = await fileToBase64(imageFile);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
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
      if (response.status === 503) {
        throw new Error(`Dịch vụ Gemini API tạm thời không khả dụng (503). Vui lòng kiểm tra: 1) API key trong file .env có đúng và đang hoạt động không, 2) Generative Language API đã được bật trong Google Cloud Console chưa, 3) API key có quyền truy cập vào model ${model} không. Nếu tất cả đều đúng, hãy thử lại sau vài phút vì có thể là lỗi tạm thời của dịch vụ.`);
      } else if (response.status === 401) {
        throw new Error(`API key không hợp lệ hoặc không có quyền truy cập (401). Vui lòng kiểm tra lại VITE_GEMINI_API_KEY trong file .env`);
      } else if (response.status === 403) {
        throw new Error(`API key không có quyền truy cập vào tính năng này (403). Vui lòng kiểm tra quyền của API key`);
      } else if (response.status === 404) {
        throw new Error(`Model ${model} không tìm thấy (404). Vui lòng kiểm tra: 1) API key có đúng không, 2) Generative Language API đã được bật trong Google Cloud Console chưa, 3) Model ${model} có khả dụng với API key của bạn không.`);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
    throw error;
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